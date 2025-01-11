import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiConfig } from 'wagmi';
import { config } from '../config/wagmi';

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

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <Web3Context.Provider value={{}}>
        {children}
      </Web3Context.Provider>
    </WagmiConfig>
  );
};
