import React, { Suspense, useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { HelmetProvider } from 'react-helmet-async';
import CssBaseline from '@mui/material/CssBaseline';
import { queryClient } from './store';
import { Router } from './router';
import { theme } from './theme';
import { styledTheme } from './theme/styledTheme';
import { AuthProvider } from './features/auth/providers/AuthProvider';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Alert } from './components/ui/Alert';
import { TokenForgeAuthProvider } from '@/features/auth/providers/TokenForgeAuthProvider';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './config/wagmiConfig';
import { firebaseService } from '@/config/firebase';
import { initializeAuth } from '@/lib/firebase/auth';
import { getFirebaseManager } from '@/lib/firebase/services';
import { logger } from '@/utils/logger';

const AppContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialiser les services Firebase dans l'ordre correct
        // selon l'architecture modulaire définie
        logger.info('App', 'Initialisation des services Firebase...');
        
        // 1. Initialiser le service principal (firebase.ts)
        await firebaseService.initialize();
        logger.info('App', 'Service Firebase principal initialisé');
        
        // 2. S'assurer que l'authentification est initialisée (auth.ts)
        await initializeAuth();
        logger.info('App', 'Service d\'authentification initialisé');
        
        // 3. Initialiser le gestionnaire Firebase (pour Firestore)
        await getFirebaseManager();
        logger.info('App', 'Gestionnaire Firebase initialisé');
        
        logger.info('App', 'Services Firebase initialisés avec succès');
        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(`Erreur lors de l'initialisation de l'application: ${errorMessage}`);
        logger.error('App', 'Erreur d\'initialisation', err);
      }
    };

    initApp();
  }, []);

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <StyledThemeProvider theme={styledTheme}>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <WagmiProvider config={wagmiConfig}>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  <TokenForgeAuthProvider>
                    {error && (
                      <Alert
                        type="error"
                        title="Erreur"
                        onClose={() => setError(null)}
                      >
                        {error}
                      </Alert>
                    )}
                    <Suspense fallback={<LoadingSpinner />}>
                      <Router />
                    </Suspense>
                  </TokenForgeAuthProvider>
                </AuthProvider>
              </QueryClientProvider>
            </WagmiProvider>
          </MuiThemeProvider>
        </StyledThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default function App() {
  return <AppContent />;
}
