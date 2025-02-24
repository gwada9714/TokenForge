import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box, Card, CardContent, CardHeader, CircularProgress } from '@mui/material';
import { useTokenChartData } from '@/hooks/analytics/useTokenChartData';
import { TokenChartProps, ChartOptions } from '@/types/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const TokenTransactionsChart: React.FC<TokenChartProps> = ({
  token,
  period = 'daily',
  height = 300,
  className,
}) => {
  const { transactionsData, loading } = useTokenChartData(token, period);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress />
      </Box>
    );
  }

  if (!transactionsData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader title="Historique des Transactions" />
      <CardContent>
        <Box height={height}>
          <Bar data={transactionsData} options={defaultOptions} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenTransactionsChart;
