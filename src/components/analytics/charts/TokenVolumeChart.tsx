import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  PointElement,
  LineElement,
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

const TokenVolumeChart: React.FC<TokenChartProps> = ({
  token,
  period = 'daily',
  height = 300,
  className,
}) => {
  const { volumeData, loading } = useTokenChartData(token, period);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress />
      </Box>
    );
  }

  if (!volumeData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader title="Volume d'échanges" />
      <CardContent>
        <Box height={height}>
          <Line data={volumeData} options={defaultOptions} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenVolumeChart;
