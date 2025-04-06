import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {icon && <Box sx={{ color: "primary.main" }}>{icon}</Box>}
      </Box>
    </Paper>
  );
};

interface DashboardStatsProps {
  stats?: {
    tokensCreated?: number;
    activeStaking?: number;
    totalValue?: string;
    userBalance?: string;
  };
  isLoading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats = {
    tokensCreated: 0,
    activeStaking: 0,
    totalValue: "0",
    userBalance: "0",
  },
  isLoading = false,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tokens Créés"
          value={isLoading ? "..." : stats.tokensCreated || 0}
          description="Nombre total de tokens créés"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Staking Actif"
          value={isLoading ? "..." : stats.activeStaking || 0}
          description="Nombre de positions de staking actives"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Valeur Totale"
          value={isLoading ? "..." : stats.totalValue || "0 ETH"}
          description="Valeur totale des tokens"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Votre Balance"
          value={isLoading ? "..." : stats.userBalance || "0 ETH"}
          description="Balance de votre portefeuille"
        />
      </Grid>
    </Grid>
  );
};
