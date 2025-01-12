import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const useWeb3 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  const handleConnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await connect({ connector: connectors[0] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [connect, connectors]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }, [disconnect]);

  return {
    connect: handleConnect,
    disconnect: handleDisconnect,
    isConnected,
    address,
    isLoading,
    error
  };
};