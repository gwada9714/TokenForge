import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { logger } from './core/logger';
import { Router } from './router';

// Déclaration pour TypeScript
declare global {
  interface Window {
    appInitialized?: boolean;
  }
}

/**
 * Version diagnostique du composant App
 * Sans initialisation Firebase ni Auth pour l'instant
 */
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    // Simuler un chargement court puis initialiser l'application
    const timer = setTimeout(() => {
      try {
        logger.info({
          category: 'AppDiagnostic',
          message: 'Application prête à afficher le routeur'
        });
        setIsRouterReady(true);
      } catch (err) {
        logger.error({
          category: 'AppDiagnostic',
          message: `Erreur d'initialisation: ${err instanceof Error ? err.message : String(err)}`,
          error: err instanceof Error ? err : new Error(String(err))
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement de TokenForge...
        </Typography>
      </Box>
    );
  }

  if (!isRouterReady) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 600,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Erreur d'initialisation de l'application
          </Typography>
          <Typography variant="body1">
            TokenForge n'a pas pu initialiser le système de navigation correctement.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Si tout est prêt, afficher le routeur
  return <Router />;
};

export default App;
