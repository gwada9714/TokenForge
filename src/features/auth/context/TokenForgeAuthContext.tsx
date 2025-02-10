import React, { createContext, useReducer, useEffect } from 'react';
import { useConnect, useDisconnect, useAccount, usePublicClient } from 'wagmi';
import { getWalletClient } from '@wagmi/core';
import { firebaseAuth } from '../services/firebaseAuth';
import { walletReconnectionService } from '../services/walletReconnectionService';
import { authSyncService } from '../services/authSyncService';
import { authReducer, initialState } from '../reducers/authReducer';
import { TokenForgeAuthContextValue, WalletState } from '../types';
import { authActions } from '../actions/authActions';
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';
import { sessionService } from '../services/sessionService';

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | null>(null);

export const TokenForgeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const sessionData = await sessionService.getUserSession(firebaseUser.uid);
          const user = {
            ...firebaseUser,
            isAdmin: sessionData?.isAdmin ?? false,
            canCreateToken: sessionData?.canCreateToken ?? false,
            canUseServices: sessionData?.canUseServices ?? false,
            metadata: {
              ...sessionData?.metadata,
              creationTime: firebaseUser.metadata.creationTime || '',
              lastSignInTime: firebaseUser.metadata.lastSignInTime || '',
              lastLoginTime: Date.now()
            }
          };
          dispatch(authActions.loginSuccess(user));
          await authSyncService.startTokenRefresh();
        } catch (error) {
          dispatch(authActions.loginFailure(createAuthError(error)));
        }
      } else {
        dispatch(authActions.logout());
        await authSyncService.stopTokenRefresh();
      }
    });

    return () => unsubscribe();
  }, []);

  // Wallet connection state management
  useEffect(() => {
    const handleWalletState = async () => {
      if (isConnected && address) {
        try {
          const walletClient = await getWalletClient();
          if (walletClient) {
            const walletState: WalletState = {
              address,
              isConnected: true,
              chainId: walletClient.chain.id,
              provider: publicClient
            };
            dispatch(authActions.setWalletState(walletState));
            await walletReconnectionService.saveWalletState(walletState);
          }
        } catch (error) {
          console.error('Failed to handle wallet state:', error);
          dispatch(authActions.setError(createAuthError(AUTH_ERROR_CODES.WALLET_CONNECTION_ERROR)));
        }
      } else {
        dispatch(authActions.setWalletState(null));
        await walletReconnectionService.clearWalletState();
      }
    };

    handleWalletState();
  }, [address, isConnected, publicClient]);

  // Auto wallet reconnection
  useEffect(() => {
    const reconnectWallet = async () => {
      try {
        const savedState = await walletReconnectionService.getSavedWalletState();
        if (savedState && !isConnected) {
          // Attempt to reconnect
          dispatch(authActions.setWalletState(savedState));
        }
      } catch (error) {
        console.error('Failed to reconnect wallet:', error);
      }
    };

    reconnectWallet();
  }, [isConnected]);

  const contextValue: TokenForgeAuthContextValue = {
    ...state,
    dispatch
  };

  return (
    <TokenForgeAuthContext.Provider value={contextValue}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};
