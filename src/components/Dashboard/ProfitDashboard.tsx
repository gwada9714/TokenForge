import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatEther } from 'ethers';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaidIcon from '@mui/icons-material/Paid';
import { useTokenForgeStats } from '@/hooks/useTokenForgeStats';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
}> = ({ title, value, icon, subValue }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="h4">{value}</Typography>
      {subValue && (
        <Typography variant="body2" color="text.secondary">
          {subValue}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const ProfitDashboard: React.FC = () => {
  const theme = useTheme();
  const {
    totalTaxCollected,
    totalTaxToForge,
    totalTaxToDevFund,
    totalTaxToBuyback,
    totalTaxToStaking,
    totalTransactions,
    totalValueLocked,
    isLoading,
    taxHistory
  } = useTokenForgeStats();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  const formattedTaxCollected = formatEther(totalTaxCollected || 0n);
  const formattedTVL = formatEther(totalValueLocked || 0n);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        TokenForge Profit Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Tax Collected"
            value={`${Number(formattedTaxCollected).toFixed(2)} TKN`}
            icon={<PaidIcon color="primary" />}
            subValue={`From ${totalTransactions} transactions`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Value Locked"
            value={`${Number(formattedTVL).toFixed(2)} TKN`}
            icon={<AccountBalanceWalletIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Revenue Distribution"
            value="Active"
            icon={<TrendingUpIcon color="primary" />}
            subValue="70% Forge | 15% Dev | 10% Buyback | 5% Staking"
          />
        </Grid>
      </Grid>

      <Card sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tax Collection History
        </Typography>
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taxHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="taxAmount"
                fill={theme.palette.primary.main}
                name="Tax Collected"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tax Distribution
              </Typography>
              <Box mt={2}>
                <Typography variant="body1">
                  TokenForge Treasury: {formatEther(totalTaxToForge || 0n)} TKN
                </Typography>
                <Typography variant="body1">
                  Development Fund: {formatEther(totalTaxToDevFund || 0n)} TKN
                </Typography>
                <Typography variant="body1">
                  Buyback & Burn: {formatEther(totalTaxToBuyback || 0n)} TKN
                </Typography>
                <Typography variant="body1">
                  Staking Rewards: {formatEther(totalTaxToStaking || 0n)} TKN
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Box mt={2}>
                <Typography variant="body1">
                  Average Tax per Transaction: {
                    (Number(formattedTaxCollected) / (totalTransactions || 1)).toFixed(4)
                  } TKN
                </Typography>
                <Typography variant="body1">
                  Total Transactions: {totalTransactions}
                </Typography>
                <Typography variant="body1">
                  Treasury Growth Rate: {
                    ((Number(formatEther(totalTaxToForge || 0n)) / 
                    Number(formattedTaxCollected)) * 100).toFixed(2)
                  }%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfitDashboard;
