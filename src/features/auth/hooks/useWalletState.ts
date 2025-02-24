import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useTokenForgeAuth } from '../providers/TokenForgeAuthProvider';
import { authActions } from '../store/authActions';
import { errorService } from '../services/errorService';

interface WalletState {
  address: `0x${string}` | null;
  isConnected: boolean;
  chainId?: number;
  loading: boolean;
  error: Error | null;
}

export function useWalletState() {
  const { wallet, dispatch } = useTokenForgeAuth();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    dispatch(authActions.updateWallet({
      address: address || null,
      isConnected
    }));
  }, [address, isConnected, dispatch]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      dispatch(authActions.setError(errorService.handleError(error)));
    }
  };

  return {
    ...wallet,
    disconnect: handleDisconnect
  };
}
