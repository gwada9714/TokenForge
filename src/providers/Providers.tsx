import React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig, chains } from '../config/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { memo } from 'react';
import { muiTheme } from '../theme/mui';
import { ThemeProvider } from 'styled-components';
import { styledTheme } from '../theme/forge-theme';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { AuthProvider } from '../contexts/AuthContext';
import { ContractProvider } from './ContractProvider';
import { Web3Provider } from '../contexts/Web3Provider';
import '@rainbow-me/rainbowkit/styles.css';

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

const Providers = memo<ProvidersProps>(({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider 
          chains={chains}
          modalSize="compact"
        >
          <StyledEngineProvider injectFirst>
            <MuiThemeProvider theme={muiTheme}>
              <ThemeProvider theme={styledTheme}>
                <StyleSheetManager enableVendorPrefixes shouldForwardProp={isPropValid}>
                  <CssBaseline />
                  <Web3Provider>
                    <ContractProvider>
                      <AuthProvider>
                        {children}
                      </AuthProvider>
                    </ContractProvider>
                  </Web3Provider>
                </StyleSheetManager>
              </ThemeProvider>
            </MuiThemeProvider>
          </StyledEngineProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
});

Providers.displayName = 'Providers';

export default Providers;