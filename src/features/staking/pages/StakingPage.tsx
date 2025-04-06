import React from "react";
import { Container, Typography, Paper, Box, Grid } from "@mui/material";

export const StakingPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Staking
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Pools de Staking Disponibles
              </Typography>
              {/* Liste des pools de staking à implémenter */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
