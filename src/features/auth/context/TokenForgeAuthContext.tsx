import React, { createContext, useReducer, useContext, useCallback, useEffect } from 'react';
import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { getWalletClient, type WalletClient } from '@wagmi/core';
import { firebaseService } from '../services/firebaseService';
import { errorService } from '../services/errorService';
import { walletReconnectionService } from '../services/walletReconnectionService';
import { authSyncService } from '../services/authSyncService';
import { authReducer, initialState } from '../reducers/authReducer';
import { TokenForgeAuthContextValue } from '../types';
import { authActions } from '../actions/authActions';
import { createAuthError } from '../errors/AuthError';

const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | null>(null);

export const TokenForgeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await firebaseService.getUserData(firebaseUser.uid);
          dispatch(authActions.loginSuccess(user));
          // Démarrer le refresh de token
          authSyncService.startTokenRefresh();
        } catch (error) {
          const authError = errorService.handleAuthError(error);
          dispatch(authActions.loginFailure(authError));
        }
      } else {
        dispatch(authActions.logout());
        // Arrêter le refresh de token
        authSyncService.stopTokenRefresh();
      }
    });

    return () => {
      unsubscribe();
      authSyncService.stopTokenRefresh();
    };
  }, []);

  // Wallet connection listener
  useEffect(() => {
    if (isConnected && address) {
      getWalletClient().then(async (client: WalletClient | null) => {
        if (client) {
          const chainId = client.chain.id;
          const isCorrectNetwork = walletReconnectionService.isCorrectNetwork(chainId);

          dispatch(authActions.connectWallet({
            isConnected: true,
            address,
            chainId,
            isCorrectNetwork,
            provider: client.transport,
            walletClient: client
          }));

          try {
            // Synchroniser l'état du wallet avec l'authentification
            await authSyncService.synchronizeWalletAndAuth(
              {
                isConnected: true,
                address,
                chainId,
                isCorrectNetwork,
                provider: client.transport,
                walletClient: client
              },
              state
            );
          } catch (error) {
            const authError = errorService.handleAuthError(error);
            dispatch(authActions.setError(authError));
          }
        }
      }).catch(error => {
        const walletError = createAuthError(
          'AUTH_009',
          'Failed to get wallet client',
          { originalError: error }
        );
        dispatch(authActions.setError(walletError));
      });
    } else {
      dispatch(authActions.disconnectWallet());
    }
  }, [isConnected, address, state]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      dispatch(authActions.loginStart());
      const user = await firebaseService.signIn(email, password);
      dispatch(authActions.loginSuccess(user));
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.loginFailure(authError));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      dispatch(authActions.loginStart());
      const user = await firebaseService.signUp(email, password);
      dispatch(authActions.loginSuccess(user));
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.loginFailure(authError));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseService.signOut();
      if (isConnected) {
        await disconnect();
      }
      dispatch(authActions.logout());
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.setError(authError));
    }
  }, [disconnect, isConnected]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await firebaseService.resetPassword(email);
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.setError(authError));
    }
  }, []);

  const updateProfile = useCallback(async (displayName?: string, photoURL?: string) => {
    try {
      const user = await firebaseService.updateProfile(displayName, photoURL);
      dispatch(authActions.updateUser(user));
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.setError(authError));
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      // Pré-valider le réseau avant la connexion
      await walletReconnectionService.validateNetworkBeforeConnect();
      await connect();
      return true;
    } catch (error) {
      const walletError = createAuthError(
        'AUTH_009',
        'Failed to connect wallet',
        { originalError: error }
      );
      dispatch(authActions.setError(walletError));
      return false;
    }
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      dispatch(authActions.disconnectWallet());
      // Synchroniser la déconnexion avec l'état d'authentification
      await authSyncService.synchronizeWalletAndAuth(
        initialState.walletState,
        state
      );
    } catch (error) {
      const walletError = createAuthError(
        'AUTH_009',
        'Failed to disconnect wallet',
        { originalError: error }
      );
      dispatch(authActions.setError(walletError));
    }
  }, [disconnect, state]);

  const clearError = useCallback(() => {
    dispatch(authActions.clearError());
  }, []);

  const value: TokenForgeAuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    connectWallet,
    disconnectWallet,
    clearError
  };

  return (
    <TokenForgeAuthContext.Provider value={value}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};

export const useTokenForgeAuth = () => {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw createAuthError(
      'AUTH_018',
      'useTokenForgeAuth must be used within a TokenForgeAuthProvider'
    );
  }
  return context;
};
