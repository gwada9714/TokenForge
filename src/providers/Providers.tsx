import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../store/store";
import { ContractProvider } from "./ContractProvider";
import { WagmiProvider, createConfig } from "wagmi";
import { TokenForgeAuthProvider } from "../features/auth/providers/TokenForgeAuthProvider";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { web3Config } from "../config/web3Config";

// Configuration du client de requête avec mise en cache optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5000,
    },
  },
});

const wagmiConfig = createConfig(web3Config);

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <TokenForgeAuthProvider>
            <ContractProvider>
              <ReduxProvider store={store}>{children}</ReduxProvider>
            </ContractProvider>
          </TokenForgeAuthProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
};

export default Providers;
