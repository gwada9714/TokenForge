import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { TokenContract } from '@/providers/contract/ContractProvider';
import TokenVolumeChart from './charts/TokenVolumeChart';
import TokenHoldersChart from './charts/TokenHoldersChart';
import TokenTransactionsChart from './charts/TokenTransactionsChart';
import { PeriodSelector } from './controls/PeriodSelector';
import { ChartPeriod } from '@/types/analytics';

interface TokenAnalyticsDashboardProps {
  token?: TokenContract;
}

export const TokenAnalyticsDashboard: React.FC<TokenAnalyticsDashboardProps> = ({
  token,
}) => {
  const [period, setPeriod] = useState<ChartPeriod>('daily');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Analyses du Token
        </Typography>
        <PeriodSelector period={period} onChange={setPeriod} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TokenVolumeChart token={token} period={period} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TokenHoldersChart token={token} period={period} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TokenTransactionsChart token={token} period={period} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TokenAnalyticsDashboard;
