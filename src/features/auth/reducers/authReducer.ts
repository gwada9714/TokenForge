import { TokenForgeAuthState, TokenForgeUser } from '../types/auth';
import { AuthError } from '../errors/AuthError';

export const initialState: TokenForgeAuthState = {
  status: 'idle',
  isAuthenticated: false,
  user: null,
  error: null,
  wallet: {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    walletClient: null
  },
  loading: false
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: TokenForgeUser; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: AuthError }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_FAILURE'; payload: AuthError }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS'; payload: TokenForgeUser }
  | { type: 'SIGNUP_FAILURE'; payload: AuthError }
  | { type: 'WALLET_CONNECTING' }
  | { type: 'WALLET_CONNECTED'; payload: { address: string; chainId: number } }
  | { type: 'WALLET_DISCONNECTED' }
  | { type: 'WALLET_CONNECTION_FAILED'; payload: AuthError }
  | { type: 'NETWORK_SWITCHING' }
  | { type: 'NETWORK_CHANGED'; payload: { chainId: number } }
  | { type: 'NETWORK_SWITCH_FAILED'; payload: AuthError }
  | { type: 'CLEAR_ERROR' };

export function authReducer(state: TokenForgeAuthState = initialState, action: AuthAction): TokenForgeAuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return {
        ...state,
        status: 'loading',
        loading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        status: 'authenticated',
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null
      };

    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        status: 'authenticated',
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null
      };

    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        status: 'error',
        loading: false,
        error: action.payload
      };

    case 'LOGOUT_START':
      return {
        ...state,
        loading: true
      };

    case 'LOGOUT_SUCCESS':
      return {
        ...initialState
      };

    case 'LOGOUT_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'WALLET_CONNECTING':
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'WALLET_CONNECTED':
      return {
        ...state,
        loading: false,
        wallet: {
          ...state.wallet,
          isConnected: true,
          address: action.payload.address,
          chainId: action.payload.chainId,
          isCorrectNetwork: true // Sera mis à jour par NETWORK_CHANGED si nécessaire
        }
      };

    case 'WALLET_DISCONNECTED':
      return {
        ...state,
        loading: false,
        wallet: {
          isConnected: false,
          address: null,
          chainId: null,
          isCorrectNetwork: false,
          walletClient: null
        }
      };

    case 'WALLET_CONNECTION_FAILED':
      return {
        ...state,
        loading: false,
        error: action.payload,
        wallet: {
          ...initialState.wallet
        }
      };

    case 'NETWORK_SWITCHING':
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'NETWORK_CHANGED':
      return {
        ...state,
        loading: false,
        wallet: {
          ...state.wallet,
          chainId: action.payload.chainId,
          isCorrectNetwork: true // Vous pouvez ajouter une vérification ici si nécessaire
        }
      };

    case 'NETWORK_SWITCH_FAILED':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}
