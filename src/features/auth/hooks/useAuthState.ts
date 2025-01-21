import { useCallback, useEffect, useReducer } from 'react';
import { errorService } from '../services/errorService';
import { firebaseAuth } from '../services/firebaseAuth';
import { sessionService } from '../services/sessionService';
import { TokenForgeUser, AuthStatus } from '../types/auth';
import { authActions, AuthAction } from '../actions/authActions';
import { authReducer, initialState } from '../reducers/authReducer';
import { AuthError } from '../errors/AuthError';

interface AuthStateHook {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  dispatch: React.Dispatch<AuthAction>;
}

export const useAuthState = (): AuthStateHook => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    status: 'idle' as AuthStatus,
    isAuthenticated: false,
    user: null,
    error: null
  });

  // Gérer les changements de session Firebase
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const sessionData = await sessionService.getUserSession(user.uid);
          const tokenForgeUser: TokenForgeUser = {
            ...user,
            isAdmin: sessionData?.isAdmin ?? false,
            canCreateToken: sessionData?.canCreateToken ?? false,
            canUseServices: sessionData?.canUseServices ?? false,
            metadata: {
              ...sessionData?.metadata,
              creationTime: user.metadata.creationTime || '',
              lastSignInTime: user.metadata.lastSignInTime || '',
              lastLoginTime: Date.now()
            }
          };
          dispatch(authActions.loginSuccess(tokenForgeUser));
        } catch (error) {
          const authError = errorService.handleError(error) as AuthError;
          dispatch(authActions.loginFailure(authError));
        }
      } else {
        dispatch(authActions.logout());
      }
    });

    return () => unsubscribe();
  }, []);

  // Login avec email/password
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      dispatch(authActions.loginStart());
      await firebaseAuth.signInWithEmailAndPassword(email, password);
      // Le succès sera géré par l'effet onAuthStateChanged
    } catch (error) {
      const authError = errorService.handleError(error) as AuthError;
      dispatch(authActions.loginFailure(authError));
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await firebaseAuth.signOut();
      // Le logout sera géré par l'effet onAuthStateChanged
    } catch (error) {
      const authError = errorService.handleError(error) as AuthError;
      dispatch(authActions.setError(authError));
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    dispatch
  };
};
