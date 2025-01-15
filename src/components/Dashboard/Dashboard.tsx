import React, { useState, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import { NetworkSelector } from '../NetworkSelector/NetworkSelector';
import { NetworkConfig, getNetwork } from '@/config/networks';
import { formatEther } from 'viem';
import { useNetwork } from 'wagmi';
import { Address } from 'viem';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TokenIcon from '@mui/icons-material/Token';
import GroupIcon from '@mui/icons-material/Group';
import LaunchIcon from '@mui/icons-material/Launch';
import { useTokenStats } from '@/hooks/useTokenStats';
import { useUserTokens } from '@/hooks/useUserTokens';
import { Virtuoso } from 'react-virtuoso';

interface TokenData {
  address: `0x${string}`;
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  owner: `0x${string}`;
  network?: NetworkConfig;
  createdAt: Date;
  features: {
    isBurnable: boolean;
    isMintable: boolean;
    isPausable: boolean;
    hasMaxWallet: boolean;
    hasMaxTransaction: boolean;
    hasAntiBot: boolean;
    hasBlacklist: boolean;
    premium: boolean;
  };
  taxConfig?: {
    enabled: boolean;
    buyTax: number;
    sellTax: number;
    transferTax: number;
    taxRecipient: `0x${string}`;
    taxStats?: {
      totalTaxCollected: bigint;
      totalTransactions: number;
    };
  };
  stats?: {
    holders: number;
    transactions: number;
    price: string;
    marketCap: string;
  };
}

interface TokenStats {
  totalValue: bigint;
  transactionVolume: bigint;
  uniqueHolders: number;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  subValue?: string;
}

const StatCard = memo<StatCardProps>(({ title, value, icon, isLoading, subValue }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {icon}
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4">{isLoading ? '...' : value}</Typography>
      {subValue && (
        <Typography variant="body2" color="text.secondary">
          {subValue}
        </Typography>
      )}
    </CardContent>
  </Card>
));

const TokenRow = memo<{ token: TokenData }>(({ token }) => (
  <TableRow>
    <TableCell>{token.name}</TableCell>
    <TableCell>{token.symbol}</TableCell>
    <TableCell>
      <Chip 
        label={token.network?.name || 'Unknown Network'}
        size="small"
        variant="outlined"
      />
    </TableCell>
    <TableCell>{formatEther(token.totalSupply)}</TableCell>
    <TableCell>
      {new Date(token.createdAt).toLocaleDateString()}
    </TableCell>
    <TableCell align="right">
      <Tooltip title="View on Explorer">
        <IconButton
          size="small"
          onClick={() => window.open(
            token.network ? 
              `${token.network.explorerUrl}/token/${token.address}` :
              '#',
            '_blank'
          )}
        >
          <LaunchIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </TableCell>
  </TableRow>
));

const TokenList = memo<{ tokens: TokenData[] }>(({ tokens }) => (
  <Virtuoso
    style={{ height: '400px' }}
    totalCount={tokens.length}
    itemContent={index => <TokenRow token={tokens[index]} />}
  />
));

const useGlobalStats = () => {
  const { stats, isLoading, error } = useTokenStats();
  const { tokens: userTokens } = useUserTokens();
  
  return useMemo(() => {
    let totalTaxCollected = BigInt(0);
    let totalTransactions = 0;
    let totalTokens = userTokens?.length || 0;
    let totalPremiumTokens = 0;

    userTokens?.forEach((token: TokenData) => {
      if (token.taxConfig?.taxStats) {
        totalTaxCollected += token.taxConfig.taxStats.totalTaxCollected;
        totalTransactions += token.taxConfig.taxStats.totalTransactions;
      }
      if (token.features.premium) {
        totalPremiumTokens++;
      }
    });

    return {
      totalTaxCollected,
      totalTransactions,
      totalTokens,
      totalPremiumTokens,
      isLoading,
      error
    };
  }, [userTokens, isLoading, error]);
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig | undefined>(
    chain ? getNetwork(chain.id) : undefined
  );
  
  const { 
    stats,
    isLoading: isStatsLoading 
  } = useTokenStats(selectedNetwork?.chain.id);
  
  const {
    tokens: userTokens,
    isLoading: isTokensLoading
  } = useUserTokens(selectedNetwork?.chain.id);

  const globalStats = useGlobalStats();

  const statsCards = useMemo(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Total Value Locked"
          value={stats ? formatEther(stats.totalValue) : "0"}
          icon={<AccountBalanceWalletIcon color="primary" />}
          isLoading={isStatsLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Transaction Volume"
          value={stats ? formatEther(stats.transactionVolume) : "0"}
          icon={<ShowChartIcon color="primary" />}
          isLoading={isStatsLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Total Tokens"
          value={userTokens ? userTokens.length.toString() : "0"}
          icon={<TokenIcon color="primary" />}
          isLoading={isTokensLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Unique Holders"
          value={stats ? stats.uniqueHolders.toString() : "0"}
          icon={<GroupIcon color="primary" />}
          isLoading={isStatsLoading}
        />
      </Grid>
    </Grid>
  ), [stats, userTokens, isStatsLoading, isTokensLoading]);

  const mappedTokens = userTokens?.map(token => ({
    ...token,
    tier: token.features.premium ? ('premium' as const) : ('basic' as const)
  })) || [];

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onNetworkSelect={setSelectedNetwork}
              showTestnets
              onShowTestnetsChange={() => {}}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6">Create New Token</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/tokens/create')}
              startIcon={<TokenIcon />}
            >
              Create Token
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={8}>
          {statsCards}
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Tokens
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Network</TableCell>
                    <TableCell>Total Supply</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TokenList tokens={mappedTokens} />
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(Dashboard);