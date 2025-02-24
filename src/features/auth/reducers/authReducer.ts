import { TokenForgeAuthState, TokenForgeUser } from '../types/auth';
import { AuthError } from '../errors/AuthError';
import { AUTH_ACTIONS } from '../actions/authActions';

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
  loading: false, // Initialisation de loading
  isAdmin: false, // Ajout de isAdmin
  canCreateToken: false, // Ajout de canCreateToken
  canUseServices: false // Ajout de canUseServices
};

type AuthAction =
  | { type: typeof AUTH_ACTIONS.LOGIN_START }
  | { type: typeof AUTH_ACTIONS.LOGIN_SUCCESS; payload: { user: TokenForgeUser; token: string } }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.UPDATE_USER; payload: Partial<TokenForgeUser> }
  | { type: typeof AUTH_ACTIONS.SET_ERROR; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.CLEAR_ERROR };

export const authReducer = (state: TokenForgeAuthState = initialState, action: AuthAction): TokenForgeAuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return initialState;
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};
