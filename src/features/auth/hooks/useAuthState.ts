import { useCallback, useEffect, useReducer } from 'react';
import { errorService } from '../errors/errorService';
import { firebaseAuth } from '../services/firebaseAuth';
import { sessionService } from '../services/sessionService';
import { TokenForgeUser, TokenForgeMetadata } from '../types';
import { authActions } from '../actions/authActions';
import { authReducer, initialState } from '../reducers/authReducer';

export const useAuthState = () => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    status: 'idle',
    isAuthenticated: false,
    user: null,
    error: null
  });

  // Gérer les changements de session Firebase
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        const metadata: TokenForgeMetadata = {
          creationTime: user.metadata.creationTime || '',
          lastSignInTime: user.metadata.lastSignInTime || '',
          lastLoginTime: Date.now(),
          walletAddress: undefined,
          chainId: undefined,
          customMetadata: {}
        };

        const tokenForgeUser: TokenForgeUser = {
          ...user,
          isAdmin: false,
          canCreateToken: false,
          canUseServices: false,
          metadata
        };
        dispatch(authActions.loginSuccess(tokenForgeUser));
      } else {
        dispatch(authActions.logout());
      }
    });

    return () => unsubscribe();
  }, []);

  // Login avec email/password
  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(authActions.loginStart());
      await firebaseAuth.signInWithEmailAndPassword(email, password);
      // Note: le succès sera géré par l'effet onSessionChange
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.loginFailure(authError));
      throw authError;
    }
  }, []);

  // Login avec Google
  const loginWithGoogle = useCallback(async () => {
    try {
      dispatch(authActions.loginStart());
      await firebaseAuth.signInWithGoogle();
      // Note: le succès sera géré par l'effet onSessionChange
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.loginFailure(authError));
      throw authError;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await sessionService.endSession();
      await firebaseAuth.signOut();
      dispatch(authActions.logout());
    } catch (error) {
      const authError = errorService.handleAuthError(error);
      dispatch(authActions.setError(authError));
      throw authError;
    }
  }, []);

  // Reset error
  const resetError = useCallback(() => {
    dispatch(authActions.clearError());
  }, []);

  return {
    ...state,
    login,
    loginWithGoogle,
    logout,
    resetError
  };
};
