import { TokenForgeAuthState } from '../types';
import { AUTH_ACTIONS, AuthAction } from '../actions/authActions';

export const initialState: TokenForgeAuthState = {
  status: 'idle',
  isAuthenticated: false,
  user: null,
  error: null,
  walletState: {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    provider: null,
    walletClient: null
  },
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false
};

export const authReducer = (
  state: TokenForgeAuthState,
  action: AuthAction
): TokenForgeAuthState => {
  switch (action.type) {
    // Auth actions
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        status: 'loading',
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        status: 'authenticated',
        isAuthenticated: true,
        user: action.payload,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        status: 'error',
        isAuthenticated: false,
        user: null,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return initialState;

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        status: 'error'
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        status: state.isAuthenticated ? 'authenticated' : 'idle'
      };

    // Wallet actions
    case AUTH_ACTIONS.WALLET_CONNECT:
      return {
        ...state,
        walletState: action.payload
      };

    case AUTH_ACTIONS.WALLET_DISCONNECT:
      return {
        ...state,
        walletState: initialState.walletState
      };

    case AUTH_ACTIONS.WALLET_NETWORK_CHANGE:
      return {
        ...state,
        walletState: {
          ...state.walletState,
          chainId: action.payload.chainId,
          isCorrectNetwork: action.payload.isCorrectNetwork
        }
      };

    case AUTH_ACTIONS.WALLET_UPDATE_PROVIDER:
      return {
        ...state,
        walletState: {
          ...state.walletState,
          provider: action.payload.provider
        }
      };

    default:
      return state;
  }
};
