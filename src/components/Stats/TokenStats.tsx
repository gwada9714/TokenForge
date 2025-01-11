import React from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import TokenIcon from "@mui/icons-material/Token";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShowChartIcon from "@mui/icons-material/ShowChart";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box sx={{ color: "primary.main" }}>{icon}</Box>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" component="div">
            {value}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {title}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export const TokenStats: React.FC = () => {
  // Ces valeurs seront plus tard récupérées depuis le smart contract
  const stats = {
    totalTokens: 150,
    activeWallets: 1240,
    weeklyVolume: "25.5K",
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <StatCard
          title="Tokens Created"
          value={stats.totalTokens}
          icon={<TokenIcon sx={{ fontSize: 40 }} />}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <StatCard
          title="Active Wallets"
          value={stats.activeWallets}
          icon={<AccountBalanceWalletIcon sx={{ fontSize: 40 }} />}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <StatCard
          title="Weekly Volume"
          value={stats.weeklyVolume}
          icon={<ShowChartIcon sx={{ fontSize: 40 }} />}
        />
      </Grid>
    </Grid>
  );
};
