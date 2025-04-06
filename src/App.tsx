import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { Router } from './router';
import { logger } from './core/logger';
import TokenForgeAuthProvider from './features/auth/providers/TokenForgeAuthProvider';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
// Import des éléments nécessaires pour Wagmi
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
// Import nécessaire pour React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Utiliser notre configuration de Wagmi unifiée
import { getWagmiConfig } from './hooks/useWagmiConfig';

// Déclaration pour TypeScript
declare global {
  interface Window {
    appInitialized?: boolean;
  }
}

// Créer une instance de QueryClient pour React Query
const queryClient = new QueryClient();

// Récupérer la configuration Wagmi
const wagmiConfig = getWagmiConfig();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        logger.info({
          category: 'Application',
          message: 'Application initialisée avec succès'
        });
        setIsInitialized(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({
          category: 'Application',
          message: `Erreur d'initialisation: ${error.message}`,
          error
        });
        setError(error);
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

  if (error || !isInitialized) {
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
            {error ? error.message : "TokenForge n'a pas pu initialiser correctement."}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Si tout est prêt, afficher l'application avec les providers nécessaires
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider>
            <TokenForgeAuthProvider>
              <Router />
            </TokenForgeAuthProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
