import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { DashboardStats } from './DashboardStats';

interface DashboardOverviewProps {
  isLoading?: boolean;
  stats?: {
    tokensCreated?: number;
    activeStaking?: number;
    totalValue?: string;
    userBalance?: string;
  };
  userName?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  isLoading = false,
  stats,
  userName = 'Utilisateur'
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Tableau de bord
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Bienvenue, {userName}. Voici un aperçu de votre activité sur TokenForge.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <DashboardStats stats={stats} isLoading={isLoading} />
      </Paper>
    </Box>
  );
};
