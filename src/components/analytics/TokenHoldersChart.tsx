import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box, Card, CardContent, CardHeader, CircularProgress } from '@mui/material';
import { TokenContract } from '@/providers/contract/ContractProvider';
import { useTokenChartData } from '@/hooks/analytics/useTokenChartData';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TokenHoldersChartProps {
  token?: TokenContract;
}

export const TokenHoldersChart: React.FC<TokenHoldersChartProps> = ({ token }) => {
  const { holdersData, loading, error } = useTokenChartData(token);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !holdersData) {
    return null;
  }

  return (
    <Card>
      <CardHeader title="Distribution des Détenteurs" />
      <CardContent>
        <Box height={300}>
          <Pie
            data={holdersData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right' as const,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.formattedValue;
                      return `${label}: ${value}%`;
                    },
                  },
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenHoldersChart;
