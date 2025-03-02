import { useContext, useEffect, useState } from 'react';
import { TokenForgeAuthContext } from '../providers/TokenForgeAuthProvider';
import { useAuthState } from './useAuthState';
import { useWalletState } from './useWalletState';
import { useAdminStatus } from './useAdminStatus';
import { TokenForgeAuthContextValue } from '../types/auth';
import { AuthError, AuthErrorCode } from '../errors/AuthError';
import { firebaseAuth } from '../services/firebaseAuth';
import { useAccount, useChainId } from 'wagmi';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export function useTokenForgeAuth(): TokenForgeAuthContextValue {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw new Error('useTokenForgeAuth must be used within a TokenForgeAuthProvider');
  }

  // Get auth state without destructuring loading to avoid unused variable warnings
  const authState = useAuthState();
  const walletState = useWalletState();
  const adminStatus = useAdminStatus(authState.user?.uid);

  const user = authState.user;
  const wallet = walletState.wallet;
  const isAdmin = adminStatus.isAdmin;
  const { isConnected } = useAccount();
  const chainId = useChainId();

  // Determine if on correct network (replace with your network check logic)
  const isCorrectNetwork = chainId === 1 || chainId === 11155111; // Mainnet or Sepolia

  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // We'll remove the unused variables

  // Authentication function implementation
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion avec:', email);
      await firebaseAuth.signIn(email, password);
      setState({ isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      // Use the error directly if it's already an AuthError, otherwise create a new one
      let authError: AuthError;

      if (error instanceof AuthError) {
        authError = error;
      } else {
        // Use a helper function to create the error with proper enum value
        authError = new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          (error as Error)?.message || 'Une erreur inconnue est survenue',
          error
        );
      }
      setState({ isAuthenticated: false, isLoading: false, error: authError });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setState((prev: AuthState) => ({ ...prev, isLoading: true }));

        // Vérifier si le wallet est connecté et sur le bon réseau
        const isAuth = isConnected && isCorrectNetwork;

        console.log('État de l\'authentification:', { isConnected, isCorrectNetwork });

        setState({
          isAuthenticated: isAuth,
          isLoading: false,
          error: null
        });
      } catch (err) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: new AuthError(
            AuthErrorCode.INTERNAL_ERROR,
            'Erreur lors de la vérification de l\'authentification',
            err
          )
        });
      }
    };

    checkAuth();
  }, [isConnected, isCorrectNetwork]);

  // Construct a partial TokenForgeAuthContextValue with the properties we have
  return {
    user,
    wallet,
    isAuthenticated: state.isAuthenticated,
    loading: state.isLoading,
    error: state.error,
    isAdmin,
    status: 'idle', // Default value
    canCreateToken: false, // Default value
    canUseServices: false, // Default value
    isInitialized: true, // Default value
    dispatch: () => { }, // Empty function as placeholder
    signIn, // Use the implemented signIn function
    signUp: async () => { }, // Empty function as placeholder
    signOut: async () => { }, // Empty function as placeholder
    resetPassword: async () => { }, // Empty function as placeholder
    updateProfile: async () => { }, // Empty function as placeholder
    updateUser: async () => { }, // Empty function as placeholder
    connectWallet: async () => { }, // Empty function as placeholder
    disconnectWallet: async () => { }, // Empty function as placeholder
    clearError: () => { }, // Empty function as placeholder
    validateAdminAccess: () => false // Empty function as placeholder
  };
}
