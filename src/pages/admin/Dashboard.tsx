import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

const AdminDashboard: React.FC = () => {
  return (
    <Box p={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        Administration
      </Typography>
      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Statistiques Générales
          </Typography>
          {/* Add statistics components here */}
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Activité Récente
          </Typography>
          {/* Add activity log component here */}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
