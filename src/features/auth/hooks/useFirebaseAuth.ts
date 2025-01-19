import { useEffect, useState, useCallback } from 'react';
import { firebaseAuth, type AuthSession } from '../services/firebaseAuth';
import { useAuthManager } from './useAuthManager';
import { createAuthError } from '../errors/AuthError';

interface FirebaseAuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: Error | null;
}

export const useFirebaseAuth = () => {
  const { account, provider } = useAuthManager();
  const [state, setState] = useState<FirebaseAuthState>({
    session: null,
    isLoading: true,
    error: null,
  });

  // Écouter les changements de session
  useEffect(() => {
    const unsubscribe = firebaseAuth.onSessionChange((session) => {
      setState(prev => ({
        ...prev,
        session,
        isLoading: false,
      }));
    });

    return () => unsubscribe();
  }, []);

  // Authentification avec le wallet
  const signInWithWallet = useCallback(async () => {
    if (!account || !provider) {
      throw createAuthError(
        'AUTH_001',
        'Wallet not connected'
      );
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const signer = await provider.getSigner();
      const message = `Sign this message to authenticate with TokenForge\nNonce: ${Date.now()}`;
      const signature = await signer.signMessage(message);

      const session = await firebaseAuth.signInWithWallet(account, signature);
      
      setState(prev => ({
        ...prev,
        session,
        isLoading: false,
        error: null,
      }));

      return session;
    } catch (error) {
      const authError = createAuthError(
        'AUTH_003',
        'Failed to sign in with wallet',
        { originalError: error }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));

      throw authError;
    }
  }, [account, provider]);

  // Déconnexion
  const signOut = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await firebaseAuth.signOut();
      setState(prev => ({
        ...prev,
        session: null,
        isLoading: false,
      }));
    } catch (error) {
      const authError = createAuthError(
        'AUTH_004',
        'Failed to sign out',
        { originalError: error }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));

      throw authError;
    }
  }, []);

  // Envoi de l'email de vérification
  const sendVerificationEmail = useCallback(async () => {
    if (!state.session) {
      throw createAuthError(
        'AUTH_004',
        'No active session'
      );
    }

    try {
      await firebaseAuth.sendVerificationEmail();
    } catch (error) {
      throw createAuthError(
        'AUTH_005',
        'Failed to send verification email',
        { originalError: error }
      );
    }
  }, [state.session]);

  // Rafraîchissement de la session
  const refreshSession = useCallback(async () => {
    if (!state.session) return;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await firebaseAuth.refreshSession();
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      const authError = createAuthError(
        'AUTH_004',
        'Failed to refresh session',
        { originalError: error }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));

      throw authError;
    }
  }, [state.session]);

  return {
    ...state,
    signInWithWallet,
    signOut,
    sendVerificationEmail,
    refreshSession,
  };
};
