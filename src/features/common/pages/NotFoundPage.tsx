import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Typography variant="h1" component="h1">
          404
        </Typography>
        <Typography variant="h5" component="h2">
          Page non trouvée
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
}; 