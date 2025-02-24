import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

export const DashboardHome: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tableau de bord
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Mes Tokens
            </Typography>
            {/* Liste des tokens à implémenter */}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activité récente
            </Typography>
            {/* Activité récente à implémenter */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
