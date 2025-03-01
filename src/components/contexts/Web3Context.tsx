import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the context value type
interface Web3ContextType {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Create the context with a default value
const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  account: null,
  chainId: null,
  balance: null,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  isLoading: false,
  error: null
});

// Provider props type
interface Web3ProviderProps {
  children: ReactNode;
}

// Provider component
export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize web3 connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // In a real implementation, this would check if the user is already connected
        // For now, we'll simulate a disconnected state
        setIsConnected(false);
        setAccount(null);
        setChainId(null);
        setBalance(null);
      } catch (err) {
        console.error('Error checking connection:', err);
        setError('Failed to initialize Web3 connection');
      }
    };

    checkConnection();
  }, []);

  // Connect wallet
  const connect = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would connect to the user's wallet
      // For now, we'll simulate a successful connection
      setIsConnected(true);
      setAccount('0x1234567890123456789012345678901234567890');
      setChainId(1); // Ethereum Mainnet
      setBalance('1.5');
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = (): void => {
    // In a real implementation, this would disconnect from the user's wallet
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setBalance(null);
  };

  // Switch network
  const switchNetwork = async (targetChainId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would switch the network in the user's wallet
      // For now, we'll simulate a successful network switch
      setChainId(targetChainId);
    } catch (err) {
      console.error('Error switching network:', err);
      setError('Failed to switch network');
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value: Web3ContextType = {
    isConnected,
    account,
    chainId,
    balance,
    connect,
    disconnect,
    switchNetwork,
    isLoading,
    error
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Custom hook to use the Web3 context
export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
