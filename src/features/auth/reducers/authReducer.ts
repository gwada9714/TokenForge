import { BaseAuthState } from '../types';
import { AUTH_ACTIONS, AuthAction } from '../actions/authActions';

export const initialState: BaseAuthState = {
  status: 'idle',
  isAuthenticated: false,
  user: null,
  error: null,
  emailVerified: false,
  walletState: {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    provider: null
  }
};

export const authReducer = (state: BaseAuthState, action: AuthAction): BaseAuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        status: 'loading',
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        status: 'authenticated',
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        status: 'error',
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
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
        emailVerified: true,
      };

    case AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE:
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };

    case AUTH_ACTIONS.WALLET_CONNECT:
    case AUTH_ACTIONS.WALLET_NETWORK_CHANGE:
      return {
        ...state,
        walletState: {
          ...state.walletState,
          ...action.payload
        }
      };

    case AUTH_ACTIONS.SESSION_REFRESH:
      return {
        ...state,
        status: 'authenticated',
        error: null,
      };

    case AUTH_ACTIONS.SESSION_EXPIRED:
      return {
        ...state,
        status: 'unauthenticated',
        isAuthenticated: false,
      };

    case AUTH_ACTIONS.SET_STATUS:
      return {
        ...state,
        status: action.payload,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
