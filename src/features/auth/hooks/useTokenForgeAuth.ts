import { useReducer, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import type { TokenForgeAuth, TokenForgeUser, WalletState, TokenForgeAuthState } from '../types';
import { getAuth, User } from 'firebase/auth';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { authReducer, initialState } from '../reducers/authReducer';
import { authActions } from '../actions/authActions';
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { sessionService } from '../services/sessionService';
import { emailVerificationService } from '../services/emailVerificationService';
import { tokenRefreshService } from '../services/tokenRefreshService';
import { adminService } from '../services/adminService';
import { type PublicClient } from 'viem';

const firebaseAuth = getAuth();

const convertToTokenForgeUser = (
  firebaseUser: User,
  storedData?: { 
    isAdmin?: boolean;
    canCreateToken?: boolean;
    canUseServices?: boolean;
    customMetadata?: Record<string, unknown>;
  }
): TokenForgeUser => {
  const metadata = {
    creationTime: firebaseUser.metadata.creationTime,
    lastSignInTime: firebaseUser.metadata.lastSignInTime,
    lastLoginTime: Date.now(),
    walletAddress: undefined,
    chainId: undefined,
  };

  return {
    ...firebaseUser,
    isAdmin: storedData?.isAdmin || false,
    canCreateToken: storedData?.canCreateToken || false,
    canUseServices: storedData?.canUseServices || false,
    customMetadata: storedData?.customMetadata || {},
    metadata
  };
};

export function useTokenForgeAuth(): TokenForgeAuth {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();

  // Firebase auth handlers
  const handleLogin = useCallback(async (firebaseUser: User) => {
    try {
      dispatch(authActions.loginStart());
      
      const storedData = await storageService.getUserData(firebaseUser.uid);
      const user = convertToTokenForgeUser(firebaseUser, storedData || undefined);
      
      // Récupérer les droits admin
      const adminRights = await adminService.getAdminRights(user);
      
      dispatch(authActions.loginSuccess({
        ...user,
        ...adminRights
      }));
      
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
      await firebaseAuth.signOut();
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
      dispatch(authActions.updateNetwork(chainId, isCorrectNetwork));
    }
  }, [isConnected, address, chainId]);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (user: User | null) => {
        if (user) {
          handleLogin(user);
        } else {
          dispatch(authActions.logout());
        }
      },
      (error: Error) => {
        const authError = createAuthError(
          AUTH_ERROR_CODES.FIREBASE_ERROR,
          error.message || 'Auth state error occurred',
          { originalError: error }
        );
        notificationService.error(authError.message);
      }
    );
    return () => unsubscribe();
  }, [handleLogin]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(authActions.loginStart());
      const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
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

  // Validation des droits admin
  const validateAdminAccess = useCallback(() => {
    const { isAdmin, isAuthenticated } = state;
    const result = adminService.validateAdminAccess(
      isAdmin,
      isAuthenticated,
      isConnected,
      chainId === Number(process.env.REACT_APP_CHAIN_ID)
    );
    
    if (!result.canAccess && result.reason) {
      notificationService.warning(result.reason);
    }
    
    return result.canAccess;
  }, [state.isAdmin, state.isAuthenticated, isConnected, chainId]);

  const walletState: WalletState = {
    isConnected,
    address: address || null,
    chainId: chainId || null,
    isCorrectNetwork: chainId === Number(process.env.REACT_APP_CHAIN_ID),
    provider: publicClient as PublicClient,
    walletClient: walletClient || null
  };

  const authState: TokenForgeAuthState = {
    ...state,
    walletState,
    isAdmin: state.user?.isAdmin || false,
    canCreateToken: state.user?.isAdmin || (state.isAuthenticated && Number(chainId) === Number(process.env.REACT_APP_CHAIN_ID)),
    canUseServices: state.isAuthenticated && isConnected && Number(chainId) === Number(process.env.REACT_APP_CHAIN_ID)
  };

  return {
    ...authState,
    validateAdminAccess,
    actions: {
      login,
      logout: handleLogout,
      updateUser
    }
  } as TokenForgeAuth;
}
