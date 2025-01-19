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
import { TokenContract } from '@/providers/contract/ContractProvider';
import { ChartPeriod, useTokenChartData } from '@/hooks/analytics/useTokenChartData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TokenVolumeChartProps {
  token?: TokenContract;
  period?: ChartPeriod;
}

export const TokenVolumeChart: React.FC<TokenVolumeChartProps> = ({
  token,
  period = 'daily',
}) => {
  const { volumeData, loading, error } = useTokenChartData(token, period);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !volumeData) {
    return null;
  }

  return (
    <Card>
      <CardHeader title="Volume de Transactions" />
      <CardContent>
        <Box height={300}>
          <Line
            data={volumeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenVolumeChart;
