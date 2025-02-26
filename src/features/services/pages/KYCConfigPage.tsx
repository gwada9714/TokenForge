import React from 'react';
import { Container, Typography, Paper, Box, Grid } from '@mui/material';

export const KYCConfigPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Configuration du KYC
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Paramètres du KYC
              </Typography>
              {/* Formulaire de configuration du KYC à implémenter */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 