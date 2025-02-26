import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

export const CreateTokenPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Créer un Token
      </Typography>
      <Paper elevation={1}>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Configuration du Token
          </Typography>
          {/* Formulaire de création de token à implémenter */}
        </Box>
      </Paper>
    </Container>
  );
}; 