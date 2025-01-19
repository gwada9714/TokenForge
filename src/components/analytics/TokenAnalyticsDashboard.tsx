import React, { useState } from 'react';
import {
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { TokenContract } from '@/providers/contract/ContractProvider';
import { ChartPeriod } from '@/hooks/analytics/useTokenChartData';
import TokenVolumeChart from './TokenVolumeChart';
import TokenHoldersChart from './TokenHoldersChart';
import TokenTransactionsChart from './TokenTransactionsChart';

interface TokenAnalyticsDashboardProps {
  token?: TokenContract;
}

export const TokenAnalyticsDashboard: React.FC<TokenAnalyticsDashboardProps> = ({
  token,
}) => {
  const [period, setPeriod] = useState<ChartPeriod>('daily');

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: ChartPeriod | null
  ) => {
    if (newPeriod) {
      setPeriod(newPeriod);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Analyses du Token
        </Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          aria-label="période d'analyse"
          size="small"
        >
          <ToggleButton value="daily" aria-label="journalier">
            Journalier
          </ToggleButton>
          <ToggleButton value="weekly" aria-label="hebdomadaire">
            Hebdomadaire
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="mensuel">
            Mensuel
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TokenVolumeChart token={token} period={period} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TokenHoldersChart token={token} />
        </Grid>
        <Grid item xs={12}>
          <TokenTransactionsChart token={token} period={period} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TokenAnalyticsDashboard;
