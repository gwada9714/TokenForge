import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAuthenticated, setAddress, setAdmin } from '../../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();
  const { connectAsync, connectors, error: connectError, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();

  // Sync wagmi state with our auth state
  useEffect(() => {
    if (isConnected && address) {
      dispatch(setAuthenticated(true));
      dispatch(setAddress(address));
      // Vérification admin basée sur VITE_DEPLOYMENT_OWNER
      const isAdmin = address.toLowerCase() === import.meta.env.VITE_DEPLOYMENT_OWNER?.toLowerCase();
      dispatch(setAdmin(isAdmin));
    } else {
      dispatch(setAuthenticated(false));
      dispatch(setAddress(null));
      dispatch(setAdmin(false));
    }
  }, [isConnected, address, dispatch]);

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

  const { isAuthenticated, isAdmin } = useAppSelector(state => state.auth);

  return {
    connect,
    disconnect,
    isConnecting,
    isDisconnected,
    isConnected: isAuthenticated,
    isAdmin,
    address,
    availableConnectors: connectors.filter(c => c.ready),
    error: connectError,
    isPending
  };
};

export default useAuth;
