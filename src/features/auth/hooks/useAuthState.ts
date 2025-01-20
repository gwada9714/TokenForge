import { useReducer, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthState, AuthAction, AUTH_ACTIONS, TokenForgeUser } from '../types';
import { errorService } from '../services/errorService';
import { emailVerificationService } from '../services/emailVerificationService';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  emailVerified: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
        emailVerified: action.payload.emailVerified,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        error: action.error || null,
        emailVerified: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
        emailVerified: action.payload.emailVerified,
      };
    case AUTH_ACTIONS.EMAIL_VERIFICATION_START:
      return {
        ...state,
        loading: true,
      };
    case AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        emailVerified: true,
      };
    case AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

export function useAuthState() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (user: FirebaseUser) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      // Vérifier si l'email est vérifié
      if (!user.emailVerified) {
        await emailVerificationService.sendVerificationEmail(user);
      }

      // Convertir l'utilisateur Firebase en TokenForgeUser
      const tokenForgeUser: TokenForgeUser = {
        ...user,
        isAdmin: user.email?.endsWith('@tokenforge.com') || false,
        customMetadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        },
      };

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: tokenForgeUser,
      });
    } catch (error) {
      const authError = errorService.handleError(error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        error: authError,
      });
      throw authError;
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const updateUser = useCallback((user: FirebaseUser) => {
    const tokenForgeUser: TokenForgeUser = {
      ...user,
      isAdmin: user.email?.endsWith('@tokenforge.com') || false,
      customMetadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    };

    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: tokenForgeUser,
    });
  }, []);

  const verifyEmail = useCallback(async () => {
    if (!state.user) return;

    try {
      dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_START });
      
      await emailVerificationService.sendVerificationEmail(state.user);
      
      // Attendre la vérification de l'email
      await emailVerificationService.waitForEmailVerification(state.user, {
        onVerified: () => {
          dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS });
        },
      });
    } catch (error) {
      const authError = errorService.handleError(error);
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE,
        error: authError,
      });
      throw authError;
    }
  }, [state.user]);

  const setError = useCallback((error: unknown) => {
    const authError = errorService.handleError(error);
    dispatch({
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      error: authError,
    });
  }, []);

  return {
    state,
    actions: {
      login,
      logout,
      updateUser,
      verifyEmail,
      setError,
    },
  };
}
