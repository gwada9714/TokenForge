import { TokenForgeAuthState, User, AuthError } from '../types';

type AuthAction =
  | { type: 'SET_STATUS'; payload: TokenForgeAuthState['status'] }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: AuthError }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_WALLET_STATE'; payload: { isConnected: boolean; address: string | null; chainId: number | null } };

export const authReducer = (state: TokenForgeAuthState, action: AuthAction): TokenForgeAuthState => {
  switch (action.type) {
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
      };
    case 'LOGIN':
      return {
        ...state,
        status: 'authenticated',
        isAuthenticated: true,
        user: action.payload,
        isAdmin: action.payload.isAdmin || false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        status: 'unauthenticated',
        isAuthenticated: false,
        user: null,
        isAdmin: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        status: 'unauthenticated',
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'UPDATE_WALLET_STATE':
      return {
        ...state,
        isConnected: action.payload.isConnected,
        address: action.payload.address,
        chainId: action.payload.chainId,
      };
    default:
      return state;
  }
};
