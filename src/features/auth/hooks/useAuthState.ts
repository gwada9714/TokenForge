import { useReducer, useCallback, useEffect } from 'react';
import { AuthState, TokenForgeUser, AuthError } from '../types';
import { errorService } from '../services/errorService';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { auth } from '../../../config/firebase';
import { User as FirebaseUser } from 'firebase/auth';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  status: 'idle',
  error: null,
};

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: TokenForgeUser }
  | { type: 'AUTH_ERROR'; payload: AuthError }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'EMAIL_VERIFICATION_START' }
  | { type: 'EMAIL_VERIFICATION_SUCCESS' }
  | { type: 'EMAIL_VERIFICATION_ERROR'; payload: AuthError }
  | { type: 'UPDATE_USER'; payload: Partial<TokenForgeUser> };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        status: 'loading',
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        status: 'authenticated',
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        status: 'error',
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        status: 'idle',
        error: null,
      };
    case 'EMAIL_VERIFICATION_START':
      return {
        ...state,
        status: 'verifying',
      };
    case 'EMAIL_VERIFICATION_SUCCESS':
      return {
        ...state,
        status: 'authenticated',
        user: state.user ? { ...state.user, emailVerified: true } : null,
      };
    case 'EMAIL_VERIFICATION_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

function convertToTokenForgeUser(firebaseUser: FirebaseUser, storedData?: { isAdmin?: boolean; customMetadata?: Record<string, unknown> }): TokenForgeUser {
  return {
    ...firebaseUser,
    isAdmin: storedData?.isAdmin ?? false,
    customMetadata: storedData?.customMetadata ?? {},
  };
}

export function useAuthState() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Charger l'état initial depuis le stockage local
  useEffect(() => {
    const storedState = storageService.getAuthState();
    if (storedState?.user) {
      // Récupérer l'utilisateur Firebase actuel
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Fusionner les données stockées avec l'utilisateur Firebase
        const user = convertToTokenForgeUser(currentUser, {
          isAdmin: storedState.user.isAdmin,
          customMetadata: storedState.user.customMetadata,
        });
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      }
    }
  }, []);

  // Sauvegarder l'état dans le stockage local quand il change
  useEffect(() => {
    if (state.status === 'authenticated') {
      storageService.saveAuthState(state.user);
    } else if (state.status === 'idle') {
      storageService.clearAuthState();
    }
  }, [state.status, state.user]);

  const handleAuthStart = useCallback(() => {
    dispatch({ type: 'AUTH_START' });
  }, []);

  const handleAuthSuccess = useCallback((user: TokenForgeUser) => {
    dispatch({ type: 'AUTH_SUCCESS', payload: user });
    notificationService.notifyLoginSuccess(user.email || 'Utilisateur inconnu');
  }, []);

  const handleAuthError = useCallback((error: unknown) => {
    const handledError = errorService.handleError(error);
    dispatch({ type: 'AUTH_ERROR', payload: handledError });
    notificationService.notifyLoginError(handledError.message);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'AUTH_LOGOUT' });
    storageService.clearAuthState();
    notificationService.notifyLogout();
  }, []);

  const handleEmailVerificationStart = useCallback(() => {
    dispatch({ type: 'EMAIL_VERIFICATION_START' });
  }, []);

  const handleEmailVerificationSuccess = useCallback(() => {
    dispatch({ type: 'EMAIL_VERIFICATION_SUCCESS' });
    notificationService.notifyEmailVerified();
  }, []);

  const handleEmailVerificationFailure = useCallback((error: unknown) => {
    const handledError = errorService.handleError(error);
    dispatch({ type: 'EMAIL_VERIFICATION_ERROR', payload: handledError });
  }, []);

  const handleUpdateUser = useCallback((update: Partial<TokenForgeUser>) => {
    dispatch({ type: 'UPDATE_USER', payload: update });
  }, []);

  return {
    state,
    actions: {
      handleAuthStart,
      handleAuthSuccess,
      handleAuthError,
      handleLogout,
      handleEmailVerificationStart,
      handleEmailVerificationSuccess,
      handleEmailVerificationFailure,
      handleUpdateUser,
    },
  };
}
