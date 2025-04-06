import React from 'react';
import { Box, Paper, Typography, Button, Container } from '@mui/material';
import { useTokenForgeAuth } from '@/hooks/useAuth';

export const WrongNetworkPage: React.FC = () => {
  const { switchNetwork } = useTokenForgeAuth();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Mauvais réseau
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Veuillez changer de réseau pour utiliser l'application.
          </Typography>
          <Button
            variant="contained"
            onClick={switchNetwork}
            sx={{ mt: 2 }}
          >
            Changer de réseau
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
