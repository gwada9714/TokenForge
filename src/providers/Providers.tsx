import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyledEngineProvider } from '@mui/material/styles';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { memo } from 'react';
import { muiTheme } from '../theme/mui';
import { ThemeProvider } from 'styled-components';
import { styledTheme } from '../theme/forge-theme';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store/store';
import { Web3Providers } from './Web3Providers';
import { Web3Provider } from '../contexts/Web3Context';
import { ContractProvider } from './ContractProvider';
import { AuthProvider } from '../contexts/AuthContext';

// Configuration du client de requête avec mise en cache optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
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
      <ReduxProvider store={store}>
        <Web3Providers>
          <Web3Provider>
            <ContractProvider>
              <AuthProvider>
                <StyledEngineProvider injectFirst>
                  <MuiThemeProvider theme={muiTheme}>
                    <ThemeProvider theme={styledTheme}>
                      <StyleSheetManager enableVendorPrefixes shouldForwardProp={isPropValid}>
                        <CssBaseline />
                        {children}
                      </StyleSheetManager>
                    </ThemeProvider>
                  </MuiThemeProvider>
                </StyledEngineProvider>
              </AuthProvider>
            </ContractProvider>
          </Web3Provider>
        </Web3Providers>
      </ReduxProvider>
    </QueryClientProvider>
  );
});

Providers.displayName = 'Providers';

export default Providers;