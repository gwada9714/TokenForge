import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";
import {
  People as PeopleIcon,
  Token as TokenIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalTokens: number;
    totalTransactions: number;
    totalVolume: string;
    growthRate: number;
  };
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const statItems = [
    {
      title: "Utilisateurs Totaux",
      value: stats.totalUsers,
      subtext: `${stats.activeUsers} actifs`,
      icon: <PeopleIcon />,
      color: "primary.main",
    },
    {
      title: "Tokens Créés",
      value: stats.totalTokens,
      subtext: "Tous réseaux confondus",
      icon: <TokenIcon />,
      color: "secondary.main",
    },
    {
      title: "Volume Total",
      value: stats.totalVolume,
      subtext: `${stats.totalTransactions} transactions`,
      icon: <AccountBalanceIcon />,
      color: "success.main",
    },
    {
      title: "Croissance",
      value: `${stats.growthRate}%`,
      subtext: "Ce mois",
      icon: <TrendingUpIcon />,
      color: "info.main",
    },
  ];

  return (
    <Grid container spacing={3}>
      {statItems.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.title}>
          <Paper elevation={1}>
            <Box
              p={3}
              display="flex"
              flexDirection="column"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                right={-20}
                top={-20}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  opacity: 0.1,
                }}
              />
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: item.color,
                    color: "white",
                    display: "flex",
                  }}
                >
                  {item.icon}
                </Box>
              </Box>
              <Typography variant="h4" component="div" gutterBottom>
                {item.value}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.subtext}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
