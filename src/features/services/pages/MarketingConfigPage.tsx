import React from 'react';
import { Container, Typography, Paper, Box, Grid } from '@mui/material';

export const MarketingConfigPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Configuration du Marketing
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Paramètres du Marketing
              </Typography>
              {/* Formulaire de configuration du marketing à implémenter */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 