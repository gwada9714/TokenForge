import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { web3Service } from '../services/web3';

interface Web3ContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  connect: async () => {},
  error: null
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const connect = useCallback(async () => {
    if (!isInitializing) {
      setError(null);
    }
    
    try {
      await web3Service.connect();
      setIsConnected(true);
    } catch (err: any) {
      if (err?.code === -32002 && isInitializing) {
        // Ignorer l'erreur pendant l'initialisation
        return;
      }
      setError(err?.message || 'Failed to connect');
      setIsConnected(false);
    }
  }, [isInitializing]);

  useEffect(() => {
    const init = async () => {
      try {
        await connect();
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [connect]);

  return (
    <Web3Context.Provider value={{ isConnected, connect, error }}>
      {children}
    </Web3Context.Provider>
  );
}; 