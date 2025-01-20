import { useReducer, useCallback, useEffect } from 'react';
import { AuthState, TokenForgeUser } from '../types';
import { errorService } from '../services/errorService';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { sessionService } from '../services/sessionService';
import { tabSyncService } from '../services/tabSyncService';
import { tokenService } from '../services/tokenService';
import { emailVerificationService } from '../services/emailVerificationService';
import { tokenRefreshService } from '../services/tokenRefreshService'; // Importation du tokenRefreshService
import { auth } from '../../../config/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { AUTH_ACTIONS, type AuthAction } from '../reducers/authReducer';
import { AuthError } from '../errors/AuthError';

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

  const handleAuthError = useCallback((error: AuthError) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_ERROR, payload: error });
    errorService.handleAuthError(error);
  }, []);

  const handleEmailVerificationSuccess = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS });
    notificationService.success('Email vérifié avec succès');
  }, []);

  const handleEmailVerificationError = useCallback((error: AuthError) => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_ERROR, payload: error });
    errorService.handleAuthError(error);
  }, []);

  const handleEmailVerificationStart = useCallback(async () => {
    if (!state.user) {
      handleAuthError(new AuthError(AuthError.CODES.NO_USER, 'Aucun utilisateur connecté'));
      return;
    }

    try {
      dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_START });
      await emailVerificationService.sendVerificationEmail(state.user);
      
      // Démarrer la vérification
      await emailVerificationService.waitForEmailVerification(
        state.user,
        {
          onVerified: handleEmailVerificationSuccess,
          timeoutMs: 300000 // 5 minutes
        }
      );
    } catch (error) {
      handleEmailVerificationError(error as AuthError);
    }
  }, [state.user, handleEmailVerificationSuccess, handleAuthError]);

  const verifyEmail = useCallback(async () => {
    if (!state.user) {
      handleAuthError(new AuthError(AuthError.CODES.NO_USER, 'Aucun utilisateur connecté'));
      return;
    }

    try {
      await emailVerificationService.checkEmailVerification(state.user);
      handleEmailVerificationSuccess();
    } catch (error) {
      handleEmailVerificationError(error as AuthError);
    }
  }, [state.user, handleEmailVerificationSuccess, handleEmailVerificationError, handleAuthError]);

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
  }, [handleAuthError]);

  const handleAuthSuccess = useCallback(async (user: TokenForgeUser) => {
    try {
      await tokenService.initialize(user);
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: user });
      notificationService.success('Authentification réussie');
      tabSyncService.syncAuthState({ user, isAuthenticated: true });
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  }, [handleAuthError]);

  const handleUpdateUser = useCallback((userData: Partial<TokenForgeUser>) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  }, []);

  const handleWalletStateUpdate = useCallback((walletState: { isConnected: boolean; address: string | null; chainId: number | null }) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_WALLET_STATE, payload: walletState });
    tabSyncService.syncWalletState(walletState);
  }, []);

  // Effets pour la synchronisation entre onglets
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

  // Effet pour la gestion de l'état d'authentification Firebase
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

        // Vérifier le statut de l'email si nécessaire
        if (!user.emailVerified) {
          try {
            await emailVerificationService.checkEmailVerification(user);
          } catch (error) {
            // On ne gère pas l'erreur ici car c'est normal si l'email n'est pas vérifié
          }
        }
      } else {
        await handleLogout();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [handleAuthSuccess, handleLogout]);

  useEffect(() => {
    if (state.isAuthenticated && tokenService.isTokenExpired()) {
      handleLogout();
    }
  }, [state.isAuthenticated, handleLogout]);

  useEffect(() => {
    if (state.user && state.status === 'authenticated') {
      // Démarrer le refresh token
      tokenRefreshService.startTokenRefresh(state.user);
    } else {
      // Arrêter le refresh token si l'utilisateur est déconnecté
      tokenRefreshService.stopTokenRefresh();
    }

    return () => {
      tokenRefreshService.stopTokenRefresh();
    };
  }, [state.user, state.status]);

  return {
    ...state,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    updateWalletState: handleWalletStateUpdate,
    startEmailVerification: handleEmailVerificationStart,
    verifyEmail,
  };
}
