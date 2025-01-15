import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { config as wagmiConfig, chains } from '../config/web3Config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { memo } from 'react';
import chakraTheme from '../theme';
import muiTheme from '../theme/mui';

// Configuration du client de requête avec mise en cache optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

// Utilisation de memo pour éviter les re-rendus inutiles
const Providers = memo(({ children }: ProvidersProps) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ChakraProvider theme={chakraTheme}>
        <QueryClientProvider client={queryClient}>
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider 
              chains={chains}
              theme={lightTheme()} 
              modalSize="compact"
              coolMode // Effet visuel sympa sans impact sur les performances
            >
              {children}
            </RainbowKitProvider>
          </WagmiConfig>
        </QueryClientProvider>
      </ChakraProvider>
    </ThemeProvider>
  );
});

Providers.displayName = 'Providers';

export { Providers };