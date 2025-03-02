import React, { createContext, useContext, ReactNode, useReducer, useEffect } from 'react';
import { useWalletStatus } from '../hooks/useWalletStatus';
import { useAuthState } from '../hooks/useAuthState';
import { AuthError } from '../errors/AuthError';
import { TokenForgeAuthContextValue, TokenForgeUser } from '../types/auth';
import { authReducer, initialState } from '../reducers/authReducer';
import { logger } from '../../../utils/firebase-logger';
import { AUTH_ACTIONS } from '../actions/authActions';
import { AuthAction } from '../../../types/authTypes';

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | undefined>(undefined);

export const TokenForgeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { user, isAuthenticated: isFirebaseAuthenticated, loading: firebaseLoading } = useAuthState();
  const {
    isConnected,
    isCorrectNetwork,
    address,
    connect,
    disconnect
    // switchNetwork is available but not used in this component
  } = useWalletStatus();

  // Combine Firebase auth and wallet status
  const isAuthenticated = isFirebaseAuthenticated && isConnected && isCorrectNetwork;
  const loading = firebaseLoading || state.loading;

  useEffect(() => {
    // Update wallet state when connection status changes
    if (user && address) {
      // Update user with wallet info if needed
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: {
          ...user,
          metadata: {
            ...user.metadata,
            walletAddress: address as string,
            chainId: isCorrectNetwork ? 1 : undefined
          }
        } as Partial<TokenForgeUser>
      });

      // Log wallet connection
      logger.info({
        category: 'Auth',
        message: 'Wallet connected',
        data: { address, isCorrectNetwork }
      });
    }

    logger.info({
      category: 'Auth',
      message: 'Auth status updated',
      data: { isAuthenticated, isConnected, isCorrectNetwork }
    });
  }, [isFirebaseAuthenticated, isConnected, isCorrectNetwork, user, address]);

  // Firebase auth methods
  const signIn = async (email: string) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      // In a real implementation, we would use email and password to authenticate
      logger.info({
        category: 'Auth',
        message: 'Sign in attempt',
        data: { email: email.substring(0, 3) + '***' } // Log partial email for debugging
      });
      // For example: const userCredential = await firebaseAuth.signIn(email, password);
      // For now, just simulate success
      if (user) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: user as TokenForgeUser, token: 'dummy-token' }
        });
      }
    } catch (error) {
      const authError = error as AuthError;
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: authError
      });
      throw error;
    }
  };

  const signUp = async (email: string) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      // In a real implementation, we would use email and password to create a new account
      logger.info({
        category: 'Auth',
        message: 'Sign up attempt',
        data: { email: email.substring(0, 3) + '***' } // Log partial email for debugging
      });
      // For example: const userCredential = await firebaseAuth.signUp(email, password);
      // For now, just simulate success
      if (user) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: user as TokenForgeUser, token: 'dummy-token' }
        });
      }
    } catch (error) {
      const authError = error as AuthError;
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: authError
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Implementation would be added here
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      const authError = error as AuthError;
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: authError
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      // In a real implementation, we would use the email to send a password reset link
      logger.info({
        category: 'Auth',
        message: 'Password reset attempt',
        data: { email: email.substring(0, 3) + '***' } // Log partial email for debugging
      });
      // For example: await firebaseAuth.sendPasswordReset(email);
      // For now, just simulate success
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    } catch (error) {
      const authError = error as AuthError;
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: authError
      });
      throw error;
    }
  };

  const updateProfile = async (displayName?: string, photoURL?: string) => {
    try {
      // Implementation would be added here
      if (user) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: {
            ...user,
            displayName,
            photoURL
          } as Partial<TokenForgeUser>
        });
      }
    } catch (error) {
      const authError = error as AuthError;
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: authError
      });
      throw error;
    }
  };

  const updateUser = async (userData: Partial<TokenForgeUser>) => {
    try {
      // Implementation would be added here
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData
      });
    } catch (error) {
      const authError = error as AuthError;
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: authError
      });
      throw error;
    }
  };

  // Wallet methods
  const connectWallet = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      await connect('0x0', 1); // Default to mainnet

      // The wallet state will be updated in the useEffect hook
    } catch (error) {
      const authError = error as AuthError;
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: authError
      });
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      const authError = error as AuthError;
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: authError
      });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const validateAdminAccess = () => {
    return state.isAdmin;
  };

  const authContextValue: TokenForgeAuthContextValue = {
    user: state.user,
    wallet: state.wallet,
    isAuthenticated,
    loading,
    error: state.error,
    isAdmin: state.isAdmin,
    status: state.status,
    canCreateToken: state.canCreateToken,
    canUseServices: state.canUseServices,
    isInitialized: true, // Always initialized since we're using the reducer
    dispatch: dispatch as React.Dispatch<AuthAction>,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updateUser,
    connectWallet,
    disconnectWallet,
    clearError,
    validateAdminAccess
  };

  return (
    <TokenForgeAuthContext.Provider value={authContextValue}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};

export const useTokenForgeAuth = () => {
  const context = useContext(TokenForgeAuthContext);
  if (context === undefined) {
    throw new Error('useTokenForgeAuth must be used within a TokenForgeAuthProvider');
  }
  return context;
};

export default TokenForgeAuthProvider;
