import React, { useState, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Grid, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
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

interface IToken {
  address: Address;
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  owner: Address;
  network?: ReturnType<typeof getNetwork>;
  createdAt: Date;
  features: {
    isBurnable: boolean;
    isMintable: boolean;
    isPausable: boolean;
    hasMaxWallet: boolean;
    hasMaxTransaction: boolean;
    hasAntiBot: boolean;
    hasBlacklist: boolean;
  };
  taxConfig?: {
    enabled: boolean;
    buyTax: number;
    sellTax: number;
    transferTax: number;
    taxRecipient: Address;
  };
  stats?: {
    holders: number;
    transactions: number;
    price: string;
    marketCap: string;
  };
  // Ajout des statistiques de taxe
  taxStats?: {
    totalTaxCollected: bigint;
    totalTransactions: number;
  };
  tier: 'basic' | 'premium';
}

const StatCard = memo<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
}>(({ title, value, icon, subValue }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {icon}
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
      {subValue && (
        <Typography variant="body2" color="text.secondary">
          {subValue}
        </Typography>
      )}
    </CardContent>
  </Card>
));

const TokenRow = memo<{ token: IToken }>(({ token }) => (
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

const TokensTable = memo<{ tokens: IToken[] | undefined; isLoading: boolean }>(({ tokens, isLoading }) => {
  if (isLoading) {
    return <CircularProgress />;
  }

  if (!tokens?.length) {
    return (
      <TableRow>
        <TableCell colSpan={6} align="center">
          No tokens created yet
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Virtuoso
      style={{ height: '400px' }}
      totalCount={tokens.length}
      itemContent={index => <TokenRow token={tokens[index]} />}
    />
  );
});

// Ajout des hooks pour les statistiques globales
const useGlobalStats = () => {
  const { data: tokenStats } = useTokenStats();
  
  return useMemo(() => {
    let totalTaxCollected = BigInt(0);
    let totalTransactions = 0;
    let totalTokens = tokenStats?.length || 0;
    let totalPremiumTokens = 0;

    tokenStats?.forEach(token => {
      if (token.taxStats) {
        totalTaxCollected += token.taxStats.totalTaxCollected;
        totalTransactions += token.taxStats.totalTransactions;
      }
      if (token.tier === 'premium') {
        totalPremiumTokens++;
      }
    });

    return {
      totalTaxCollected,
      totalTransactions,
      totalTokens,
      totalPremiumTokens
    };
  }, [tokenStats]);
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
    tokens,
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
          value={tokens ? tokens.length.toString() : "0"}
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
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Tokens Créés"
          value={globalStats.totalTokens.toString()}
          icon={<TokenIcon />}
          subValue={`${globalStats.totalPremiumTokens} Premium`}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Taxes Collectées"
          value={formatEther(globalStats.totalTaxCollected)}
          icon={<AccountBalanceWalletIcon />}
          subValue="Total depuis le lancement"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Transactions"
          value={globalStats.totalTransactions.toString()}
          icon={<ShowChartIcon />}
          subValue="Transactions totales"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Réseau Actif"
          value={chain?.name || 'Non connecté'}
          icon={<GroupIcon />}
        />
      </Grid>
    </Grid>
  ), [stats, tokens, isStatsLoading, isTokensLoading, globalStats]);

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
                  <TokensTable tokens={tokens} isLoading={isTokensLoading} />
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