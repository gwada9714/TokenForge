import { useCallback, useContext, useEffect } from 'react';
import { TokenForgeAuthContext } from '../context/TokenForgeAuthContext';
import { useAuthState } from './useAuthState';
import { useWalletState } from './useWalletState';
import { sessionService } from '../services/sessionService';
import { errorService } from '../services/errorService';
import { authActions } from '../actions/authActions';
import { TokenForgeUser, TokenForgeAuthState } from '../types/auth';
import { firebaseAuth } from '../services/firebaseAuth';
import { AuthError } from '../errors/AuthError';

export interface TokenForgeAuthHook extends TokenForgeAuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<TokenForgeUser>) => Promise<void>;
  resetError: () => void;
  isFullyAuthenticated: boolean;
  canAccessServices: boolean;
}

export const useTokenForgeAuth = (): TokenForgeAuthHook => {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw new Error('useTokenForgeAuth must be used within a TokenForgeAuthProvider');
  }

  const { dispatch, ...state } = context;
  const auth = useAuthState();
  const wallet = useWalletState();

  // Synchronisation de l'état d'authentification
  useEffect(() => {
    if (auth.user && !state.user) {
      dispatch(authActions.loginSuccess({
        ...auth.user,
        metadata: {
          ...auth.user.metadata,
          lastLoginTime: Date.now()
        }
      }));
    } else if (!auth.user && state.user) {
      dispatch(authActions.logout());
    }
  }, [auth.user, state.user, dispatch]);

  // Synchronisation de l'état du wallet
  useEffect(() => {
    if (wallet.isConnected !== state.walletState.isConnected) {
      if (wallet.isConnected) {
        dispatch(authActions.connectWallet(wallet));
      } else {
        dispatch(authActions.disconnectWallet());
      }
    }
  }, [wallet.isConnected, state.walletState.isConnected, dispatch]);

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
    if (wallet.isConnected && !state.walletState.isConnected) {
      void walletReconnectionService.startReconnection();
    }
  }, [wallet.isConnected, state.walletState.isConnected]);

  // Login avec Google
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    try {
      auth.dispatch(authActions.loginStart());
      await firebaseAuth.signInWithGoogle();
      // Le succès sera géré par useAuthState
    } catch (error) {
      const authError = errorService.handleError(error) as AuthError;
      auth.dispatch(authActions.loginFailure(authError));
    }
  }, [auth]);

  // Reset error
  const resetError = useCallback((): void => {
    auth.dispatch(authActions.clearError());
  }, [auth]);

  // Mise à jour du profil utilisateur
  const updateUserProfile = useCallback(async (updates: Partial<TokenForgeUser>): Promise<void> => {
    try {
      if (!auth.user?.uid) throw new Error('User not authenticated');
      await sessionService.updateUserSession(auth.user.uid, updates);
      auth.dispatch(authActions.updateUser(updates));
    } catch (error) {
      const authError = errorService.handleError(error) as AuthError;
      auth.dispatch(authActions.setError(authError));
    }
  }, [auth]);

  const isFullyAuthenticated = auth.isAuthenticated && wallet.isConnected && wallet.isCorrectNetwork;
  const canAccessServices = auth.isAuthenticated && auth.user?.canUseServices && wallet.isCorrectNetwork;

  return {
    // État authentification
    ...auth,
    // État wallet
    ...wallet,
    // Méthodes
    loginWithGoogle,
    resetError,
    updateUserProfile,
    // États dérivés
    isFullyAuthenticated,
    canAccessServices
  };
};
