import React, { createContext, useReducer, useContext, useCallback, useEffect } from 'react';
import { useConnect, useDisconnect, useAccount, usePublicClient } from 'wagmi';
import { getWalletClient } from '@wagmi/core';
import { firebaseService } from '../services/firebaseService';
import { errorService } from '../services/errorService';
import { walletReconnectionService } from '../services/walletReconnectionService';
import { authSyncService } from '../services/authSyncService';
import { authReducer, initialState } from '../reducers/authReducer';
import { TokenForgeAuthContextValue } from '../types';
import { authActions } from '../actions/authActions';
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue>({
  ...initialState,
  dispatch: () => null
});

export const TokenForgeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await firebaseService.getUserData(firebaseUser.uid);
          dispatch(authActions.loginSuccess(user));
          await authSyncService.startTokenRefresh();
        } catch (error) {
          dispatch(authActions.loginFailure(createAuthError(AUTH_ERROR_CODES.FIREBASE_ERROR, 'Failed to get user data', { error })));
        }
      } else {
        dispatch(authActions.logout());
      }
    });

    return () => {
      unsubscribe();
      void authSyncService.stopTokenRefresh();
    };
  }, []);

  // Wallet connection listener
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address) {
        try {
          const walletClient = await getWalletClient();
          if (!walletClient) {
            throw createAuthError(AUTH_ERROR_CODES.WALLET_NOT_FOUND, 'Wallet client not found', { error: 'No wallet client' });
          }

          const walletState = {
            isConnected: true,
            address,
            chainId: walletClient.chain.id,
            isCorrectNetwork: walletReconnectionService.isCorrectNetwork(walletClient.chain.id),
            provider: publicClient,
            walletClient
          };

          dispatch(authActions.connectWallet(walletState));

          try {
            await authSyncService.synchronizeWalletAndAuth(walletState, state);
          } catch (error) {
            dispatch(authActions.setError(createAuthError(AUTH_ERROR_CODES.SYNC_ERROR, 'Failed to sync wallet state', { error })));
          }
        } catch (error) {
          dispatch(authActions.setError(createAuthError(AUTH_ERROR_CODES.WALLET_NOT_FOUND, 'Failed to connect wallet', { error })));
        }
      } else {
        dispatch(authActions.disconnectWallet());
      }
    };

    void handleWalletConnection();
  }, [isConnected, address, state, publicClient]);

  // Network change listener
  useEffect(() => {
    const handleNetworkChange = async () => {
      try {
        await walletReconnectionService.validateNetwork(state.walletState.chainId);
      } catch (error) {
        dispatch(authActions.setError(createAuthError(AUTH_ERROR_CODES.NETWORK_MISMATCH, 'Network change failed', { error })));
      }
    };

    void handleNetworkChange();
  }, [state.walletState.chainId]);

  const value: TokenForgeAuthContextValue = {
    ...state,
    dispatch
  };

  return (
    <TokenForgeAuthContext.Provider value={value}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};
