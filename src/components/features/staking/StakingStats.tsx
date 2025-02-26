import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

interface StakingStatsProps {
  totalStaked?: string;
  apy?: string;
  rewards?: string;
  stakingPeriod?: string;
}

export const StakingStats: React.FC<StakingStatsProps> = ({
  totalStaked = '0',
  apy = '0%',
  rewards = '0',
  stakingPeriod = '0 days'
}) => {
  return (
    <Card className="w-full">
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Staked
            </Typography>
            <Typography variant="h6">{totalStaked}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              APY
            </Typography>
            <Typography variant="h6">{apy}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Rewards
            </Typography>
            <Typography variant="h6">{rewards}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Staking Period
            </Typography>
            <Typography variant="h6">{stakingPeriod}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StakingStats; 