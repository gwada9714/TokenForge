import { TokenForgeAuthState, TokenForgeUser, AuthError, BaseAuthState } from '../types';

export const AUTH_ACTIONS = {
  SET_STATUS: 'auth/setStatus',
  LOGIN_START: 'auth/loginStart',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  LOGOUT: 'auth/logout',
  UPDATE_USER: 'auth/updateUser',
  EMAIL_VERIFICATION_START: 'auth/emailVerificationStart',
  EMAIL_VERIFICATION_SUCCESS: 'auth/emailVerificationSuccess',
  EMAIL_VERIFICATION_FAILURE: 'auth/emailVerificationFailure',
  UPDATE_WALLET_STATE: 'auth/updateWalletState',
} as const;

type AuthAction =
  | { type: typeof AUTH_ACTIONS.SET_STATUS; payload: TokenForgeAuthState['status'] }
  | { type: typeof AUTH_ACTIONS.LOGIN_START }
  | { type: typeof AUTH_ACTIONS.LOGIN_SUCCESS; payload: TokenForgeUser }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.UPDATE_USER; payload: Partial<TokenForgeUser> }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_START }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.UPDATE_WALLET_STATE; payload: { isConnected: boolean; address: string | null; chainId: number | null } };

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
        emailVerified: action.payload.emailVerified,
      };
      
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        status: 'unauthenticated',
        isAuthenticated: false,
        error: action.payload,
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
      };
      
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
      
    case AUTH_ACTIONS.EMAIL_VERIFICATION_START:
      return {
        ...state,
        status: 'loading',
      };
      
    case AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS:
      return {
        ...state,
        status: 'authenticated',
        user: state.user ? { ...state.user, emailVerified: true } : null,
        emailVerified: true,
      };
      
    case AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE:
      return {
        ...state,
        status: 'authenticated',
        error: action.payload,
      };
      
    default:
      return state;
  }
};
