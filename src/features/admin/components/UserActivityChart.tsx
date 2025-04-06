import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface UserActivityChartProps {
  data: Array<{
    date: string;
    logins: number;
    tokenCreations: number;
    transactions: number;
  }>;
}

/**
 * Composant affichant l'activité des utilisateurs sous forme de graphique linéaire
 */
export const UserActivityChart: React.FC<UserActivityChartProps> = ({
  data,
}) => {
  const theme = useTheme();

  // Personnaliser le tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={`item-${index}`}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

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
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
            <YAxis tick={{ fontSize: 12 }} tickMargin={10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="logins"
              name="Connexions"
              stroke={theme.palette.primary.main}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="tokenCreations"
              name="Créations de tokens"
              stroke={theme.palette.secondary.main}
            />
            <Line
              type="monotone"
              dataKey="transactions"
              name="Transactions"
              stroke={theme.palette.success.main}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

// Valeurs par défaut pour le développement et les tests
UserActivityChart.defaultProps = {
  data: [
    { date: "01/03", logins: 40, tokenCreations: 24, transactions: 10 },
    { date: "02/03", logins: 30, tokenCreations: 13, transactions: 23 },
    { date: "03/03", logins: 20, tokenCreations: 98, transactions: 45 },
    { date: "04/03", logins: 27, tokenCreations: 39, transactions: 28 },
    { date: "05/03", logins: 18, tokenCreations: 48, transactions: 19 },
    { date: "06/03", logins: 23, tokenCreations: 38, transactions: 42 },
    { date: "07/03", logins: 34, tokenCreations: 43, transactions: 30 },
  ],
};
