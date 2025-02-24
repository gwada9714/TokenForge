import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { store, queryClient } from './store';
import { Router } from './router';
import { theme } from './theme';
import { AuthProvider } from './auth/AuthProvider';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Alert } from './components/ui/Alert';
import { GlobalStyle } from './theme/styles/global';

const AppContent = () => {
  const [error, setError] = React.useState<string | null>(null);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
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
            </AuthProvider>
          </QueryClientProvider>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <AppContent />
    </React.StrictMode>
  );
};

export default App;
