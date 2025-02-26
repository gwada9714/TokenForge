import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

interface DashboardOverviewProps {
  totalTokens?: number;
  activeStaking?: number;
  totalValue?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  totalTokens = 0,
  activeStaking = 0,
  totalValue = '0'
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper className="p-4">
          <Typography variant="h6">Total Tokens</Typography>
          <Typography variant="h4">{totalTokens}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper className="p-4">
          <Typography variant="h6">Active Staking</Typography>
          <Typography variant="h4">{activeStaking}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper className="p-4">
          <Typography variant="h6">Total Value</Typography>
          <Typography variant="h4">{totalValue}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardOverview; 