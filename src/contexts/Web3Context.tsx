import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface Web3ContextType {
  isConnected: boolean;
  isInitialized: boolean;
  address: string | undefined;
  chainId: number | undefined;
  isCorrectNetwork: boolean;
  isLoading: boolean;
  error: Error | null;
  network: {
    isSupported: boolean;
    isMainnet: boolean;
    isTestnet: boolean;
    currentNetwork: string | undefined;
    isSwitching: boolean;
    switchToTestnet: () => Promise<void>;
    switchToMainnet: () => Promise<void>;
  };
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { 
    isInitialized,
    hasError,
    errorMessage,
    isConnecting,
    isReconnecting
  } = useWalletConnection();

  const {
    isSupported,
    isMainnet,
    isTestnet,
    currentNetwork,
    isSwitching,
    error: networkError,
    switchToTestnet,
    switchToMainnet
  } = useNetworkStatus();

  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    // Un réseau est considéré comme correct s'il est supporté
    // et qu'il s'agit soit du mainnet soit de Sepolia
    setIsCorrectNetwork(
      isSupported && 
      (currentNetwork === 'Ethereum' || currentNetwork === 'Sepolia')
    );
  }, [isSupported, currentNetwork]);

  const value = {
    isConnected,
    isInitialized,
    address,
    chainId: undefined, // Sera défini par le réseau actuel
    isCorrectNetwork,
    isLoading: isConnecting || isReconnecting || isSwitching,
    error: hasError ? new Error(errorMessage || networkError || 'Unknown error') : null,
    network: {
      isSupported,
      isMainnet,
      isTestnet,
      currentNetwork,
      isSwitching,
      switchToTestnet,
      switchToMainnet
    }
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
