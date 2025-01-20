import { useReducer, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import type { TokenForgeAuth, TokenForgeUser } from '../types';
import { auth } from '../../../config/firebase';
import { signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { authReducer, initialState } from '../reducers/authReducer';
import { authActions } from '../actions/authActions';
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { sessionService } from '../services/sessionService';
import { emailVerificationService } from '../services/emailVerificationService';
import { tokenRefreshService } from '../services/tokenRefreshService';
import type { BrowserProvider } from 'ethers';

const convertToTokenForgeUser = (
  firebaseUser: FirebaseUser,
  storedData?: { isAdmin?: boolean; customMetadata?: Record<string, unknown> }
): TokenForgeUser => {
  const metadata = {
    creationTime: firebaseUser.metadata.creationTime,
    lastSignInTime: firebaseUser.metadata.lastSignInTime,
    lastLoginTime: Date.now(),
    walletAddress: null,
    chainId: null,
    customMetadata: storedData?.customMetadata
  };

  return {
    ...firebaseUser,
    isAdmin: storedData?.isAdmin || false,
    metadata
  };
};

export function useTokenForgeAuth(): TokenForgeAuth {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const provider = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();

  // Firebase auth handlers
  const handleLogin = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      dispatch(authActions.loginStart());
      
      const storedData = await storageService.getUserData(firebaseUser.uid);
      const user = convertToTokenForgeUser(firebaseUser, storedData || undefined);
      
      dispatch(authActions.loginSuccess(user));
      
      if (!user.emailVerified) {
        notificationService.warning('Please verify your email address');
        await emailVerificationService.sendVerificationEmail(user);
      }

      const unsubscribe = sessionService.initializeSession((authUser) => {
        if (authUser) {
          tokenRefreshService.startTokenRefresh(authUser);
        }
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      const authError = createAuthError(
        AUTH_ERROR_CODES.FIREBASE_ERROR,
        error instanceof Error ? error.message : 'Authentication error occurred',
        { originalError: error }
      );
      dispatch(authActions.loginFailure(authError));
      notificationService.error(authError.message);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await sessionService.clearSession();
      await auth.signOut();
      disconnect();
      dispatch(authActions.logout());
    } catch (error) {
      const authError = createAuthError(
        AUTH_ERROR_CODES.FIREBASE_ERROR,
        error instanceof Error ? error.message : 'Logout error occurred',
        { originalError: error }
      );
      notificationService.error(authError.message);
    }
  }, [disconnect]);

  // Wallet connection handlers
  useEffect(() => {
    if (isConnected && address && chainId) {
      const isCorrectNetwork = Number(process.env.REACT_APP_CHAIN_ID) === chainId;
      dispatch(authActions.updateNetwork({ chainId, isCorrectNetwork }));
    }
  }, [isConnected, address, chainId]);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        handleLogin(user);
      } else {
        dispatch(authActions.logout());
      }
    }, (error) => {
      const authError = createAuthError(
        AUTH_ERROR_CODES.FIREBASE_ERROR,
        error instanceof Error ? error.message : 'Auth state error occurred',
        { originalError: error }
      );
      notificationService.error(authError.message);
    });
    return () => unsubscribe();
  }, [handleLogin]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(authActions.loginStart());
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await handleLogin(user);
    } catch (error) {
      const authError = createAuthError(
        AUTH_ERROR_CODES.FIREBASE_ERROR,
        error instanceof Error ? error.message : 'Login error occurred',
        { originalError: error }
      );
      dispatch(authActions.loginFailure(authError));
      throw authError;
    }
  }, [handleLogin]);

  const updateUser = useCallback(async (updates: Partial<TokenForgeUser>) => {
    try {
      if (!state.user) throw new Error('No user logged in');
      
      const updatedUser = { ...state.user, ...updates };
      await storageService.saveAuthState(updatedUser);
      dispatch(authActions.updateUser(updates));
      
      notificationService.success('User profile updated successfully');
    } catch (error) {
      const authError = createAuthError(
        AUTH_ERROR_CODES.STORAGE_ERROR,
        error instanceof Error ? error.message : 'Update user error occurred',
        { originalError: error }
      );
      notificationService.error(authError.message);
      throw authError;
    }
  }, [state.user]);

  const walletState = {
    isConnected,
    address: address || null,
    chainId: chainId || null,
    isCorrectNetwork: chainId === Number(process.env.REACT_APP_CHAIN_ID),
    provider: provider as BrowserProvider,
    walletClient: walletClient || null
  };

  return {
    ...state,
    walletState,
    login,
    logout: handleLogout,
    updateUser
  };
}
