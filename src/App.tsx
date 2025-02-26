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
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { firebaseService } from '@/config/firebase';

// Configuration Wagmi
const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  }
});

const AppContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await firebaseService.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError('Erreur lors de l\'initialisation de l\'application');
        console.error('Initialization error:', err);
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
            <WagmiProvider config={config}>
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
