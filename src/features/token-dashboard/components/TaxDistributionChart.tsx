import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell } from 'recharts';
import { TaxConfig } from '@/types/tokenFeatures';

interface TaxDistributionChartProps {
  taxConfig: TaxConfig;
}

const COLORS = {
  treasury: '#2196f3',
  development: '#4caf50',
  buyback: '#f44336',
  staking: '#ff9800'
};

export const TaxDistributionChart: React.FC<TaxDistributionChartProps> = ({ taxConfig }) => {
  const data = [
    {
      name: 'TokenForge',
      value: taxConfig.distribution.treasury,
      color: COLORS.treasury,
      description: 'Maintenance et profits'
    },
    {
      name: 'Développement',
      value: taxConfig.distribution.development,
      color: COLORS.development,
      description: 'Nouvelles fonctionnalités'
    },
    {
      name: 'Rachat & Burn',
      value: taxConfig.distribution.buyback,
      color: COLORS.buyback,
      description: 'Mécanisme déflationniste'
    },
    {
      name: 'Staking',
      value: taxConfig.distribution.staking,
      color: COLORS.staking,
      description: 'Récompenses staking'
    }
  ];

  const totalTax = taxConfig.baseTaxRate + (taxConfig.enabled ? taxConfig.additionalTaxRate : 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Distribution des Taxes
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Taxe Totale
            </Typography>
            <Typography variant="h4">
              {totalTax}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Taxe de Base
            </Typography>
            <Typography variant="h4">
              {taxConfig.baseTaxRate}%
            </Typography>
          </Box>
          {taxConfig.enabled && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Taxe Additionnelle
              </Typography>
              <Typography variant="h4">
                {taxConfig.additionalTaxRate}%
              </Typography>
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center">
          <PieChart width={200} height={200} data={data}>
            <Pie
              data={data}
              cx={100}
              cy={100}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>

          <Box ml={4}>
            {data.map((entry) => (
              <Box key={entry.name} mb={1}>
                <Box display="flex" alignItems="center">
                  <Box
                    width={12}
                    height={12}
                    bgcolor={entry.color}
                    borderRadius="50%"
                    mr={1}
                  />
                  <Typography variant="subtitle2">
                    {entry.name} ({entry.value}%)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {entry.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
