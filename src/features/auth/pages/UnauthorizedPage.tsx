import React from 'react';
import { Box, Paper, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Accès non autorisé
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Retour à l'accueil
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
