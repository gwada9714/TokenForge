import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import wagmiConfig, { chains } from '../config/web3Config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { memo } from 'react';
import { muiTheme } from '../theme/mui';
import { Web3Provider } from './Web3Provider';

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
const Providers: React.FC<ProvidersProps> = memo(({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider
          chains={chains}
          theme={lightTheme({
            accentColor: '#7b3fe4',
          })}
        >
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={muiTheme}>
              <CssBaseline />
              <Web3Provider>{children}</Web3Provider>
            </ThemeProvider>
          </StyledEngineProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
});

export default Providers;