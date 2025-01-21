import { TokenForgeAuthState } from '../types/auth';
import { AuthAction, AUTH_ACTIONS } from '../actions/authActions';

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
  state: TokenForgeAuthState = initialState,
  action: AuthAction
): TokenForgeAuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        status: 'loading',
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        status: state.walletState.isConnected 
          ? state.walletState.isCorrectNetwork 
            ? 'authenticated'
            : 'wallet_connected_wrong_network'
          : 'authenticated',
        isAuthenticated: true,
        user: action.payload,
        isAdmin: action.payload.isAdmin,
        canCreateToken: action.payload.canCreateToken,
        canUseServices: action.payload.canUseServices,
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
      return {
        ...initialState,
        status: state.walletState.isConnected ? 'wallet_connected' : 'idle',
        walletState: state.walletState // Preserve wallet state on logout
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
        isAdmin: action.payload.isAdmin ?? state.isAdmin,
        canCreateToken: action.payload.canCreateToken ?? state.canCreateToken,
        canUseServices: action.payload.canUseServices ?? state.canUseServices
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        status: 'error',
        error: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        status: state.isAuthenticated 
          ? 'authenticated' 
          : state.walletState.isConnected
            ? 'wallet_connected'
            : 'idle',
        error: null
      };

    case AUTH_ACTIONS.WALLET_CONNECT:
      return {
        ...state,
        status: state.isAuthenticated 
          ? action.payload.isCorrectNetwork 
            ? 'authenticated'
            : 'wallet_connected_wrong_network'
          : 'wallet_connected',
        walletState: action.payload
      };

    case AUTH_ACTIONS.WALLET_DISCONNECT:
      return {
        ...state,
        status: state.isAuthenticated ? 'authenticated' : 'idle',
        walletState: {
          ...initialState.walletState
        }
      };

    case AUTH_ACTIONS.WALLET_NETWORK_CHANGE:
      return {
        ...state,
        status: state.isAuthenticated 
          ? action.payload.isCorrectNetwork 
            ? 'authenticated'
            : 'wallet_connected_wrong_network'
          : 'wallet_connected',
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
