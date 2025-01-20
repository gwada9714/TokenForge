import { useReducer, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useChainId, useWalletClient, usePublicClient } from 'wagmi';
import { TokenForgeAuth, TokenForgeUser, WalletState } from '../types';
import { auth } from '../../../config/firebase';
import { signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { AuthError } from '../errors/AuthError';
import { authReducer, initialState } from '../reducers/authReducer';
import { authActions } from '../actions/authActions';
import { errorService } from '../services/errorService';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { sessionService } from '../services/sessionService';
import { walletReconnectionService } from '../services/walletReconnectionService';

export function useTokenForgeAuth(): TokenForgeAuth {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const provider = usePublicClient();
  const { disconnect } = useDisconnect();

  // Firebase auth handlers
  const handleLogin = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      dispatch(authActions.loginStart());
      
      const storedData = await storageService.getUserData(firebaseUser.uid);
      const user: TokenForgeUser = {
        ...firebaseUser,
        isAdmin: storedData?.isAdmin || false,
        metadata: {
          creationTime: firebaseUser.metadata.creationTime,
          lastSignInTime: firebaseUser.metadata.lastSignInTime,
          ...(storedData?.customMetadata || {})
        }
      };
      
      dispatch(authActions.loginSuccess(user));
      
      if (!user.emailVerified) {
        notificationService.warning('Please verify your email address');
      }
    } catch (error) {
      const authError = errorService.handleError(error) as AuthError;
      dispatch(authActions.loginFailure(authError));
      notificationService.error(authError.message);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      await storageService.clearUserData();
      disconnect();
      dispatch(authActions.logout());
      notificationService.info('Logged out successfully');
    } catch (error) {
      const authError = errorService.handleError(error) as AuthError;
      dispatch(authActions.setError(authError));
      notificationService.error(authError.message);
    }
  }, [disconnect]);

  // Wallet state synchronization
  useEffect(() => {
    if (isConnected && address && chainId && walletClient && provider) {
      const walletState: WalletState = {
        isConnected: true,
        address,
        chainId,
        isCorrectNetwork: walletReconnectionService.isCorrectNetwork(chainId),
        provider,
        walletClient
      };
      dispatch(authActions.connectWallet(walletState));
    } else {
      dispatch(authActions.disconnectWallet());
    }
  }, [isConnected, address, chainId, walletClient, provider]);

  // Network change handler
  useEffect(() => {
    if (chainId) {
      const isCorrectNetwork = walletReconnectionService.isCorrectNetwork(chainId);
      dispatch(authActions.updateNetwork(chainId, isCorrectNetwork));
      
      if (!isCorrectNetwork) {
        notificationService.warning('Please switch to the correct network');
      }
    }
  }, [chainId]);

  // Provider update handler
  useEffect(() => {
    if (provider) {
      dispatch(authActions.updateProvider(provider));
    }
  }, [provider]);

  // Session management
  useEffect(() => {
    const unsubscribe = sessionService.initializeSession((user) => {
      if (user) {
        handleLogin(user);
      } else {
        handleLogout();
      }
    });

    return () => unsubscribe();
  }, [handleLogin, handleLogout]);

  const isAdmin = state.user?.isAdmin || false;
  const canCreateToken = isAdmin || (state.isAuthenticated && state.walletState.isCorrectNetwork);
  const canUseServices = state.isAuthenticated && state.walletState.isConnected && state.walletState.isCorrectNetwork;

  return {
    ...state,
    isAdmin,
    canCreateToken,
    canUseServices,
    actions: {
      login: async (email: string, password: string) => {
        try {
          dispatch(authActions.loginStart());
          const { user } = await signInWithEmailAndPassword(auth, email, password);
          await handleLogin(user);
        } catch (error) {
          const authError = errorService.handleError(error) as AuthError;
          dispatch(authActions.loginFailure(authError));
          throw authError;
        }
      },
      logout: handleLogout,
      updateUser: (updates: Partial<TokenForgeUser>) => {
        dispatch(authActions.updateUser(updates));
      }
    }
  };
}
