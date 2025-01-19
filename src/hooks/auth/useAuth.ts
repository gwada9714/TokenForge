import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useCallback, useMemo } from 'react';

export const useAuth = () => {
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();
  const { connectAsync, connectors, error: connectError, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const connect = useCallback(async (connector = connectors[0]) => {
    try {
      const result = await connectAsync({ connector });
      return result;
    } catch (error) {
      console.error('Failed to connect:', error);
      return null;
    }
  }, [connectAsync, connectors]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync();
      return true;
    } catch (error) {
      console.error('Failed to disconnect:', error);
      return false;
    }
  }, [disconnectAsync]);

  const availableConnectors = useMemo(() => {
    return connectors.filter(c => c.ready);
  }, [connectors]);

  return {
    address,
    isConnecting,
    isDisconnected,
    isConnected,
    isPending,
    connect,
    disconnect,
    connectError,
    availableConnectors,
  };
};

export default useAuth;
