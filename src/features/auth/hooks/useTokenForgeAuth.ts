import { useContext, useEffect } from 'react';
import { TokenForgeAuthContext } from '../providers/TokenForgeAuthProvider';
import { useAuthState } from './useAuthState';
import { useWalletState } from './useWalletState';
import { useAdminStatus } from './useAdminStatus';
import { TokenForgeAuthContextValue } from '../types/auth';

export function useTokenForgeAuth(): TokenForgeAuthContextValue {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw new Error('useTokenForgeAuth must be used within a TokenForgeAuthProvider');
  }

  const { user, isAuthenticated, loading: firebaseLoading } = useAuthState();
  const { wallet, isConnected, loading: walletLoading } = useWalletState();
  const { isAdmin, loading: adminLoading } = useAdminStatus(user?.uid);

  const loading = firebaseLoading || walletLoading || adminLoading;

  return {
    user,
    wallet,
    isAuthenticated,
    isConnected,
    isAdmin,
    loading
  };
}
