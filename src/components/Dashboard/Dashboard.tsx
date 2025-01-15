import React, { useState } from 'react';
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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TokenIcon from '@mui/icons-material/Token';
import GroupIcon from '@mui/icons-material/Group';
import LaunchIcon from '@mui/icons-material/Launch';
import { useTokenStats } from '@/hooks/useTokenStats';
import { useUserTokens } from '@/hooks/useUserTokens';

interface ITokenStats {
  totalValue: bigint;
  transactionVolume: bigint;
  uniqueHolders: number;
}

interface IToken {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  network: NetworkConfig;
  createdAt: Date;
}

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

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    isLoading?: boolean;
  }> = ({ title, value, icon, isLoading }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {icon}
          <Typography color="text.secondary" variant="subtitle2">
            {title}
          </Typography>
        </Box>
        {isLoading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography variant="h5">{value}</Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Network Selector */}
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

        {/* Quick Actions */}
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

        {/* Statistics */}
        <Grid item xs={12} sm={8}>
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
          </Grid>
        </Grid>

        {/* Tokens Table */}
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
                  {isTokensLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={20} />
                      </TableCell>
                    </TableRow>
                  ) : tokens?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No tokens created yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    tokens?.map((token: IToken) => (
                      <TableRow key={token.address}>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;