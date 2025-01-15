import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { web3Service } from '../services/web3';
import { useNetwork } from 'wagmi';

interface Web3ContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  error: string | null;
  isInitializing: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  connect: async () => {},
  error: null,
  isInitializing: true
});

export const useWeb3 = () => useContext(Web3Context);

class Web3ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <p>Something went wrong with Web3 initialization. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { chain } = useNetwork();

  const connect = useCallback(async () => {
    if (!isInitializing) {
      setError(null);
    }
    
    try {
      if (!chain) {
        throw new Error('No chain selected');
      }

      await web3Service.connect();
      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      console.error('Web3 connection error:', err);
      if (err?.code === -32002 && isInitializing) {
        return;
      }
      setError(err?.message || 'Failed to connect');
      setIsConnected(false);
    }
  }, [isInitializing, chain]);

  useEffect(() => {
    const init = async () => {
      try {
        await connect();
      } catch (err) {
        console.error('Web3 initialization error:', err);
        setError('Failed to initialize Web3');
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [connect]);

  const contextValue = {
    isConnected,
    connect,
    error,
    isInitializing
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">Initializing Web3...</span>
      </div>
    );
  }

  return (
    <Web3ErrorBoundary>
      <Web3Context.Provider value={contextValue}>
        {children}
      </Web3Context.Provider>
    </Web3ErrorBoundary>
  );
};