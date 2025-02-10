import { useCallback, useEffect, useReducer } from 'react';
import { errorService } from '../services/errorService';
import { firebaseAuth } from '../services/firebaseAuth';
import { sessionService } from '../services/sessionService';
import { TokenForgeUser, AuthStatus } from '../types/auth';
import { authActions, AuthAction } from '../actions/authActions';
import { authReducer, initialState } from '../reducers/authReducer';
import { AuthError } from '../errors/AuthError';
import { User as FirebaseUser } from 'firebase/auth';

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
    const handleAuthStateChange = async (user: FirebaseUser | null) => {
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
          } as TokenForgeUser;
          dispatch(authActions.loginSuccess(tokenForgeUser));
        } catch (error) {
          const authError = errorService.handleError(error) as AuthError;
          dispatch(authActions.loginFailure(authError));
        }
      } else {
        dispatch(authActions.logout());
      }
    };

    const unsubscribe = firebaseAuth.onAuthStateChanged(handleAuthStateChange);
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(authActions.loginStart());
      await firebaseAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      const authError = errorService.handleError(error) as AuthError;
      dispatch(authActions.loginFailure(authError));
      throw authError;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await firebaseAuth.signOut();
      dispatch(authActions.logout());
    } catch (error) {
      const authError = errorService.handleError(error) as AuthError;
      dispatch(authActions.loginFailure(authError));
      throw authError;
    }
  }, []);

  return {
    status: state.status,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    error: state.error,
    login,
    logout,
    dispatch
  };
};
