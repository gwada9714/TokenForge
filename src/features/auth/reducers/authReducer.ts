import { TokenForgeAuthState, TokenForgeUser, AuthError, BaseAuthState } from '../types';

export const AUTH_ACTIONS = {
  AUTH_START: 'auth/loginStart',
  AUTH_SUCCESS: 'auth/loginSuccess',
  AUTH_ERROR: 'auth/loginFailure',
  AUTH_LOGOUT: 'auth/logout',
  UPDATE_USER: 'auth/updateUser',
  EMAIL_VERIFICATION_START: 'auth/emailVerificationStart',
  EMAIL_VERIFICATION_SUCCESS: 'auth/emailVerificationSuccess',
  EMAIL_VERIFICATION_ERROR: 'auth/emailVerificationFailure',
  UPDATE_WALLET_STATE: 'auth/updateWalletState',
  SET_STATUS: 'auth/setStatus'
} as const;

type AuthAction =
  | { type: typeof AUTH_ACTIONS.AUTH_START }
  | { type: typeof AUTH_ACTIONS.AUTH_SUCCESS; payload: TokenForgeUser }
  | { type: typeof AUTH_ACTIONS.AUTH_ERROR; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.AUTH_LOGOUT }
  | { type: typeof AUTH_ACTIONS.UPDATE_USER; payload: Partial<TokenForgeUser> }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_START }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_ERROR; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.UPDATE_WALLET_STATE; payload: { isConnected: boolean; address: string | null; chainId: number | null } }
  | { type: typeof AUTH_ACTIONS.SET_STATUS; payload: TokenForgeAuthState['status'] };

export type { AuthAction };

export const initialState: BaseAuthState = {
  status: 'idle',
  isAuthenticated: false,
  user: null,
  error: null,
  emailVerified: false,
};

export const authReducer = (state: BaseAuthState, action: AuthAction): BaseAuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_STATUS:
      return {
        ...state,
        status: action.payload,
      };
      
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        status: 'loading',
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        status: 'authenticated',
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...state,
        status: 'error',
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.AUTH_LOGOUT:
      return {
        ...state,
        status: 'idle',
        isAuthenticated: false,
        user: null,
        error: null,
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
        user: state.user ? { ...state.user, emailVerified: true } : null,
      };

    case AUTH_ACTIONS.EMAIL_VERIFICATION_ERROR:
      return {
        ...state,
        status: 'error',
        error: action.payload,
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
};
