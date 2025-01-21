import { useContext, useEffect, useCallback } from 'react';
import { TokenForgeAuthContext } from '../context/TokenForgeAuthContext';
import { useAuthState } from './useAuthState';
import { useWalletState } from './useWalletState';
import { authActions } from '../actions/authActions';
import { sessionService } from '../services/sessionService';
import { walletReconnectionService } from '../services/walletReconnectionService';
import { AUTH_ERROR_CODES, createAuthError } from '../errors/AuthError';
import { errorService } from '../services/errorService';
import { notificationService } from '../services/notificationService';
import { adminService } from '../services/adminService';
import { TokenForgeUser, TokenForgeAuthState } from '../types';

export const useTokenForgeAuth = (): TokenForgeAuthState & { login: (user: TokenForgeUser) => Promise<void> } => {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw createAuthError(AUTH_ERROR_CODES.INVALID_CONTEXT, 'useTokenForgeAuth must be used within a TokenForgeAuthProvider', { error: 'Context not found' });
  }

  const { dispatch, ...state } = context;
  const authState = useAuthState();
  const walletState = useWalletState();

  // Synchronisation de l'état d'authentification
  useEffect(() => {
    if (authState.user && !state.user) {
      dispatch(authActions.loginSuccess({
        ...authState.user,
        metadata: {
          ...authState.user.metadata,
          lastLoginTime: Date.now()
        }
      }));
    } else if (!authState.user && state.user) {
      dispatch(authActions.logout());
    }
  }, [authState.user, state.user, dispatch]);

  // Synchronisation de l'état du wallet
  useEffect(() => {
    if (walletState.isConnected !== state.walletState.isConnected) {
      if (walletState.isConnected) {
        dispatch(authActions.connectWallet(walletState));
      } else {
        dispatch(authActions.disconnectWallet());
      }
    }
  }, [walletState.isConnected, state.walletState.isConnected, dispatch]);

  // Gestion des droits admin
  useEffect(() => {
    const updateAdminRights = async () => {
      if (state.user) {
        try {
          const rights = await adminService.getAdminRights(state.user);
          dispatch(authActions.updateUser({
            ...state.user,
            ...rights
          }));
        } catch (error) {
          const authError = errorService.handleAuthError(error);
          notificationService.error(authError.message);
        }
      }
    };

    void updateAdminRights();
  }, [state.user, dispatch]);

  // Gestion de la session
  useEffect(() => {
    if (state.user) {
      try {
        void sessionService.initSession();
      } catch (error) {
        const authError = errorService.handleAuthError(error);
        notificationService.error(authError.message);
      }
    }
  }, [state.user]);

  // Reconnexion du wallet
  useEffect(() => {
    if (walletState.isConnected && !state.walletState.isConnected) {
      void walletReconnectionService.startReconnection();
    }
  }, [walletState.isConnected, state.walletState.isConnected]);

  const login = useCallback(async (user: TokenForgeUser) => {
    try {
      dispatch(authActions.loginStart());
      await sessionService.initSession();
      dispatch(authActions.loginSuccess(user));
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.loginFailure(authError));
      throw authError;
    }
  }, [dispatch]);

  return {
    ...state,
    login
  };
};
