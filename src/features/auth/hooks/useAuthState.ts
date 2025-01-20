import { useReducer, useCallback, useEffect } from 'react';
import { AuthState, TokenForgeUser, AuthError } from '../types';
import { errorService } from '../services/errorService';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { sessionService } from '../services/sessionService';
import { tabSyncService } from '../services/tabSyncService';
import { tokenService } from '../services/tokenService';
import { auth } from '../../../config/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { AUTH_ACTIONS, type AuthAction } from '../reducers/authReducer';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  status: 'idle',
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        status: 'loading',
        error: null,
      };
    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        status: 'authenticated',
        error: null,
      };
    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        status: 'error',
        error: action.payload,
      };
    case AUTH_ACTIONS.AUTH_LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        status: 'idle',
        error: null,
      };
    case AUTH_ACTIONS.EMAIL_VERIFICATION_START:
      return {
        ...state,
        status: 'verifying',
      };
    case AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS:
      return {
        ...state,
        status: 'authenticated',
        user: state.user ? { ...state.user, emailVerified: true } : null,
      };
    case AUTH_ACTIONS.EMAIL_VERIFICATION_ERROR:
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case AUTH_ACTIONS.UPDATE_WALLET_STATE:
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          walletAddress: action.payload.address,
          chainId: action.payload.chainId,
          isWalletConnected: action.payload.isConnected
        } : null,
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

  const handleLogout = useCallback(async () => {
    try {
      tokenService.cleanup();
      dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
      await sessionService.clearSession();
      notificationService.info('Déconnexion réussie');
      tabSyncService.syncAuthState({ user: null, isAuthenticated: false });
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  }, []);

  // Gestionnaire des messages de synchronisation
  useEffect(() => {
    const unsubscribe = tabSyncService.subscribe((message) => {
      switch (message.type) {
        case AUTH_ACTIONS.UPDATE_USER:
          dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: message.payload });
          break;
        case AUTH_ACTIONS.UPDATE_WALLET_STATE:
          dispatch({ type: AUTH_ACTIONS.UPDATE_WALLET_STATE, payload: message.payload });
          break;
        case AUTH_ACTIONS.AUTH_LOGOUT:
          handleLogout();
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [handleLogout]);

  const handleAuthStart = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
  }, []);

  const handleAuthSuccess = useCallback(async (user: TokenForgeUser) => {
    try {
      await tokenService.initialize(user);
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: user });
      notificationService.success('Authentification réussie');
      tabSyncService.syncAuthState({ user, isAuthenticated: true });
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  }, []);

  const handleAuthError = useCallback((error: AuthError) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_ERROR, payload: error });
    errorService.handleAuthError(error);
  }, []);

  const handleUpdateUser = useCallback((userData: Partial<TokenForgeUser>) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  }, []);

  const handleEmailVerificationStart = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_START });
  }, []);

  const handleEmailVerificationSuccess = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS });
    notificationService.success('Email vérifié avec succès');
  }, []);

  const handleEmailVerificationError = useCallback((error: AuthError) => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_ERROR, payload: error });
    errorService.handleAuthError(error);
  }, []);

  const handleWalletStateUpdate = useCallback((walletState: { isConnected: boolean; address: string | null; chainId: number | null }) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_WALLET_STATE, payload: walletState });
    tabSyncService.syncWalletState(walletState);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Vérifier la validité de la session
        const isSessionValid = await sessionService.isSessionValid();
        if (!isSessionValid) {
          await handleLogout();
          notificationService.warn('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        const storedData = await storageService.getAuthState();
        const tokenForgeUser = convertToTokenForgeUser(user, {
          isAdmin: storedData?.user?.isAdmin,
          customMetadata: storedData?.user?.customMetadata
        });
        await handleAuthSuccess(tokenForgeUser);
      } else {
        await handleLogout();
      }
    });

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const activityListeners = activityEvents.map(event => {
      const listener = () => {
        if (state.isAuthenticated) {
          sessionService.updateActivity();
        }
      };
      window.addEventListener(event, listener);
      return { event, listener };
    });

    return () => {
      unsubscribe();
      activityListeners.forEach(({ event, listener }) => {
        window.removeEventListener(event, listener);
      });
    };
  }, [handleAuthSuccess, handleLogout]);

  useEffect(() => {
    if (state.isAuthenticated && tokenService.isTokenExpired()) {
      handleLogout();
    }
  }, [state.isAuthenticated, handleLogout]);

  return {
    state,
    actions: {
      handleAuthStart,
      handleAuthSuccess,
      handleAuthError,
      handleLogout,
      handleEmailVerificationStart,
      handleEmailVerificationSuccess,
      handleEmailVerificationError,
      handleUpdateUser,
      handleWalletStateUpdate,
    },
  };
}
