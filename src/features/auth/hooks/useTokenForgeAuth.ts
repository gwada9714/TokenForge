import { useContext, useEffect, useState } from 'react';
import { TokenForgeAuthContext } from '../providers/TokenForgeAuthProvider';
import { useAuthState } from './useAuthState';
import { useWalletState } from './useWalletState';
import { useAdminStatus } from './useAdminStatus';
import { TokenForgeAuthContextValue } from '../types/auth';
import { useWalletStatus } from './useWalletStatus';
import { AuthError } from '../types/auth';

interface TokenForgeAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export function useTokenForgeAuth(): TokenForgeAuthContextValue {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw new Error('useTokenForgeAuth must be used within a TokenForgeAuthProvider');
  }

  const { user, isAuthenticated: firebaseAuthenticated, loading: firebaseLoading } = useAuthState();
  const { wallet, isConnected, loading: walletLoading } = useWalletState();
  const { isAdmin, loading: adminLoading } = useAdminStatus(user?.uid);
  const { isCorrectNetwork } = useWalletStatus();

  const [state, setState] = useState<TokenForgeAuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const loading = firebaseLoading || walletLoading || adminLoading;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Vérifier si le wallet est connecté et sur le bon réseau
        const isAuth = isConnected && isCorrectNetwork;
        
        setState({
          isAuthenticated: isAuth,
          isLoading: false,
          error: null
        });
      } catch (err) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: {
            code: 'auth/verification-failed',
            message: 'Erreur lors de la vérification de l\'authentification'
          }
        });
      }
    };

    checkAuth();
  }, [isConnected, isCorrectNetwork]);

  return {
    user,
    wallet,
    isAuthenticated: state.isAuthenticated,
    isConnected,
    isAdmin,
    loading: state.isLoading,
    error: state.error
  };
}
