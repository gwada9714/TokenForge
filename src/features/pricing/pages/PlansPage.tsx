import React from "react";
import { Container, Typography, Grid, Paper, Box } from "@mui/material";

export const PlansPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Plans et Tarifs
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom align="center">
                Plan Gratuit
              </Typography>
              {/* Détails du plan gratuit à implémenter */}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom align="center">
                Plan Pro
              </Typography>
              {/* Détails du plan pro à implémenter */}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom align="center">
                Plan Enterprise
              </Typography>
              {/* Détails du plan enterprise à implémenter */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
