import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store/store';
import { ContractProvider } from './ContractProvider';

// Configuration du client de requête avec mise en cache optimisée
const queryClient = new QueryClient({
  // Configuration ici...
});

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <ContractProvider>
          {/* Autres fournisseurs et composants ici */}
          {children}
        </ContractProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
};

export default Providers;