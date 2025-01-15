import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { Virtuoso } from 'react-virtuoso';
import { TokenIcon } from '../TokenDisplay/TokenIcon';
import { useUserTokens } from '../../hooks/useUserTokens';
import { useTokenStats } from '../../hooks/useTokenStats';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  owner: string;
  network: any;
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
  taxConfig: {
    enabled: boolean;
    buyTax: number;
    sellTax: number;
    transferTax: number;
    taxRecipient: string;
    taxStats?: {
      totalTaxCollected: bigint;
      totalTransactions: number;
    };
  };
  stats: {
    holders: number;
    transactions: number;
    price: string;
    marketCap: string;
  };
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
      <Paper component="span" variant="outlined" square>
        {token.network?.name || 'Unknown Network'}
      </Paper>
    </TableCell>
    <TableCell>{token.totalSupply.toString()}</TableCell>
    <TableCell>
      {new Date(token.createdAt).toLocaleDateString()}
    </TableCell>
    <TableCell align="right">
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
    </TableCell>
  </TableRow>
));

const TokenList = memo<{ tokens: TokenData[] }>(({ tokens }) => (
  <Virtuoso
    style={{ height: '400px' }}
    totalCount={tokens.length}
    itemContent={(_: number, index: number) => <TokenRow token={tokens[index]} />}
  />
));

const useGlobalStats = () => {
  const { stats, isLoading, error } = useTokenStats();
  const { tokens } = useUserTokens();
  
  return useMemo(() => {
    let totalTaxCollected = BigInt(0);
    let totalTransactions = 0;
    let totalTokens = tokens?.length || 0;
    let totalPremiumTokens = 0;

    tokens?.forEach((token: TokenData) => {
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
  }, [tokens, isLoading, error]);
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tokens, isLoading } = useUserTokens();
  
  const statsCards = useMemo(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Total Value Locked"
          value="0"
          icon={<TokenIcon color="primary" />}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Transaction Volume"
          value="0"
          icon={<TokenIcon color="primary" />}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Total Tokens"
          value={tokens ? tokens.length.toString() : "0"}
          icon={<TokenIcon color="primary" />}
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Unique Holders"
          value="0"
          icon={<TokenIcon color="primary" />}
        />
      </Grid>
    </Grid>
  ), [tokens, isLoading]);

  const mappedTokens = tokens?.map(token => ({
    ...token,
    tier: token.features.premium ? ('premium' as const) : ('basic' as const)
  })) || [];

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
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