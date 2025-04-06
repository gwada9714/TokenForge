import React from "react";
import { Paper, Box, Typography, Avatar } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
}) => {
  const isPositiveTrend = trend >= 0;

  return (
    <Paper elevation={1}>
      <Box p={2} display="flex" flexDirection="column">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Avatar sx={{ bgcolor: "primary.main" }}>{icon}</Avatar>
          <Box display="flex" alignItems="center">
            {trend !== 0 && (
              <>
                {isPositiveTrend ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={isPositiveTrend ? "success.main" : "error.main"}
                  ml={0.5}
                >
                  {Math.abs(trend)}%
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};
