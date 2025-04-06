import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export interface TokenDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

/**
 * Composant affichant la distribution des tokens sous forme de graphique en camembert
 */
export const TokenDistributionChart: React.FC<TokenDistributionChartProps> = ({
  data,
}) => {
  const theme = useTheme();

  // Formater les valeurs pour l'affichage
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Personnaliser le tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            p: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
          }}
        >
          <Typography variant="subtitle2" sx={{ color: data.color }}>
            {data.name}
          </Typography>
          <Typography variant="body2">
            {formatValue(data.value)} tokens ({data.percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Ajouter le pourcentage aux données
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: Math.round((item.value / totalValue) * 100),
  }));

  return (
    <Box sx={{ width: "100%", height: 300 }}>
      {data.length === 0 ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Aucune donnée disponible
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercentage}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percentage }) => `${name}: ${percentage}%`}
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

// Valeurs par défaut pour le développement et les tests
TokenDistributionChart.defaultProps = {
  data: [
    { name: "Ethereum", value: 4000, color: "#627EEA" },
    { name: "Binance", value: 3000, color: "#F3BA2F" },
    { name: "Polygon", value: 2000, color: "#8247E5" },
    { name: "Avalanche", value: 1500, color: "#E84142" },
    { name: "Solana", value: 1000, color: "#00FFA3" },
  ],
};
