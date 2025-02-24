import React, { Suspense, lazy, useEffect, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useTokenForgeAuth } from '../../hooks/useTokenForgeAuth';

// Chargement conditionnel des providers
const Web3Providers = lazy(() => import('./Web3Providers'));

// Détection des capacités du navigateur
interface BrowserCapabilities {
  hasWallet: boolean;
  supportsWebWorkers: boolean;
  supportsSecureContext: boolean;
}

const detectBrowserCapabilities = (): BrowserCapabilities => ({
  hasWallet: typeof window.ethereum !== 'undefined',
  supportsWebWorkers: 'Worker' in window,
  supportsSecureContext: window.isSecureContext,
});

export const LazyWeb3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useTokenForgeAuth();
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [shouldLoadWeb3, setShouldLoadWeb3] = useState(false);

  useEffect(() => {
    // Détection des capacités au montage
    const caps = detectBrowserCapabilities();
    setCapabilities(caps);

    // Décision de charger Web3 basée sur les capacités et l'authentification
    setShouldLoadWeb3(
      isAuthenticated &&
      caps.hasWallet &&
      caps.supportsWebWorkers &&
      caps.supportsSecureContext
    );
  }, [isAuthenticated]);

  // Affichage d'un message si les conditions ne sont pas remplies
  if (capabilities && !shouldLoadWeb3) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        {!capabilities.hasWallet && (
          <p>Un wallet Web3 est nécessaire pour utiliser cette application.</p>
        )}
        {!capabilities.supportsSecureContext && (
          <p>Cette application nécessite un contexte sécurisé (HTTPS).</p>
        )}
        {!capabilities.supportsWebWorkers && (
          <p>Votre navigateur ne supporte pas les Web Workers.</p>
        )}
        {children}
      </Box>
    );
  }

  // Chargement conditionnel du provider Web3
  return shouldLoadWeb3 ? (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      }
    >
      <Web3Providers>{children}</Web3Providers>
    </Suspense>
  ) : (
    <>{children}</>
  );
};
