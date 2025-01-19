import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box, Card, CardContent, CardHeader, CircularProgress } from '@mui/material';
import { useTokenChartData } from '@/hooks/analytics/useTokenChartData';
import { TokenChartProps, ChartOptions } from '@/types/analytics';

ChartJS.register(ArcElement, Tooltip, Legend);

const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    tooltip: {
      enabled: true,
    },
  },
};

const TokenHoldersChart: React.FC<TokenChartProps> = ({
  token,
  period = 'daily',
  height = 300,
  className,
}) => {
  const { holdersData, loading } = useTokenChartData(token, period);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress />
      </Box>
    );
  }

  if (!holdersData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader title="Distribution des Détenteurs" />
      <CardContent>
        <Box height={height}>
          <Pie data={holdersData} options={defaultOptions} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenHoldersChart;
