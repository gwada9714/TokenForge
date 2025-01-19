import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
      <Typography variant="h4" component="h1" gutterBottom>
        Accès non autorisé
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')}
        sx={{ mt: 2 }}
      >
        Retour à l'accueil
      </Button>
    </Box>
  );
};

export default Unauthorized;
