import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from '../config/wagmi.v2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface Web3ContextType {
  // Add any additional context values here if needed
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Props {
  children: ReactNode;
}

const queryClient = new QueryClient();

export function Web3Provider({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3Context.Provider value={{}}>
          {children}
        </Web3Context.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
