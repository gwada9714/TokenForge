import React from 'react';
import { Container, Typography, Paper, Box, Grid } from '@mui/material';
import { useParams } from 'react-router-dom';

export const TokenDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Détails du Token
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Informations générales
              </Typography>
              <Typography>ID du Token : {id}</Typography>
              {/* Autres détails du token à implémenter */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 