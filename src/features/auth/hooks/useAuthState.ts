import { useReducer, useCallback } from 'react';
import { AuthState, AuthAction, AUTH_ACTIONS, AuthError } from '../types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
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
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        error: action.error || null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

export function useAuthState() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((user: any) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const setError = useCallback((error: AuthError) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, error });
  }, []);

  const updateUser = useCallback((user: any) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: user });
  }, []);

  return {
    state,
    actions: {
      login,
      logout,
      setError,
      updateUser,
    },
  };
}
