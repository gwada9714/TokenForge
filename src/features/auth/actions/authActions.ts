import { TokenForgeUser, AuthError } from '../types';

export const AUTH_ACTIONS = {
  // Core Authentication
  LOGIN_START: 'auth/loginStart',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  LOGOUT: 'auth/logout',
  
  // User Management
  UPDATE_USER: 'auth/updateUser',
  UPDATE_USER_METADATA: 'auth/updateUserMetadata',
  
  // Email Verification
  EMAIL_VERIFICATION_START: 'auth/emailVerificationStart',
  EMAIL_VERIFICATION_SUCCESS: 'auth/emailVerificationSuccess',
  EMAIL_VERIFICATION_FAILURE: 'auth/emailVerificationFailure',
  
  // Wallet Integration
  WALLET_CONNECT: 'auth/walletConnect',
  WALLET_DISCONNECT: 'auth/walletDisconnect',
  WALLET_NETWORK_CHANGE: 'auth/walletNetworkChange',
  
  // Session Management
  SESSION_REFRESH: 'auth/sessionRefresh',
  SESSION_EXPIRED: 'auth/sessionExpired',
  SESSION_ERROR: 'auth/sessionError',
  
  // Status Updates
  SET_STATUS: 'auth/setStatus',
  SET_ERROR: 'auth/setError',
  CLEAR_ERROR: 'auth/clearError'
} as const;

export type AuthActionType = typeof AUTH_ACTIONS[keyof typeof AUTH_ACTIONS];

export interface AuthAction {
  type: AuthActionType;
  payload?: any;
}

// Action Creators
export const authActions = {
  loginStart: (): AuthAction => ({
    type: AUTH_ACTIONS.LOGIN_START
  }),
  
  loginSuccess: (user: TokenForgeUser): AuthAction => ({
    type: AUTH_ACTIONS.LOGIN_SUCCESS,
    payload: user
  }),
  
  loginFailure: (error: AuthError): AuthAction => ({
    type: AUTH_ACTIONS.LOGIN_FAILURE,
    payload: error
  }),
  
  logout: (): AuthAction => ({
    type: AUTH_ACTIONS.LOGOUT
  }),
  
  updateUser: (userData: Partial<TokenForgeUser>): AuthAction => ({
    type: AUTH_ACTIONS.UPDATE_USER,
    payload: userData
  }),
  
  startEmailVerification: (): AuthAction => ({
    type: AUTH_ACTIONS.EMAIL_VERIFICATION_START
  }),
  
  emailVerificationSuccess: (): AuthAction => ({
    type: AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS
  }),
  
  emailVerificationFailure: (error: AuthError): AuthAction => ({
    type: AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE,
    payload: error
  }),
  
  updateWalletState: (walletState: { 
    isConnected: boolean; 
    address: string | null; 
    chainId: number | null 
  }): AuthAction => ({
    type: AUTH_ACTIONS.WALLET_CONNECT,
    payload: walletState
  }),
  
  setStatus: (status: string): AuthAction => ({
    type: AUTH_ACTIONS.SET_STATUS,
    payload: status
  }),
  
  setError: (error: AuthError): AuthAction => ({
    type: AUTH_ACTIONS.SET_ERROR,
    payload: error
  }),
  
  clearError: (): AuthAction => ({
    type: AUTH_ACTIONS.CLEAR_ERROR
  })
};
