import { getWalletClient } from '@wagmi/core';
import { User as FirebaseUser } from 'firebase/auth';

export type WalletClientType = Awaited<ReturnType<typeof getWalletClient>>;

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'verifying' | 'error';

// Codes d'erreur spécifiques à l'authentification
export const AUTH_ERROR_CODES = {
  WALLET_NOT_FOUND: 'AUTH_001',
  NETWORK_MISMATCH: 'AUTH_002',
  INVALID_SIGNATURE: 'AUTH_003',
  SESSION_EXPIRED: 'AUTH_004',
  FIREBASE_ERROR: 'AUTH_005',
  TWO_FACTOR_REQUIRED: 'AUTH_006',
  TWO_FACTOR_INVALID: 'AUTH_007',
  WALLET_DISCONNECTED: 'AUTH_008',
  PROVIDER_ERROR: 'AUTH_009',
} as const;

export type ErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];

export interface AuthError extends Error {
  code: ErrorCode;
  details?: Record<string, unknown>;
  toJSON(): Record<string, unknown>;
}

export interface TokenForgeUser extends FirebaseUser {
  isAdmin?: boolean;
  customMetadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  walletClient: WalletClientType | null;
  isCorrectNetwork: boolean;
  provider: any;
}

export interface AuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
}

export interface BaseAuthState extends AuthState {
  emailVerified: boolean;
}

export interface TokenForgeAuthState extends BaseAuthState, WalletState {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

export interface TokenForgeAuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithUser: (user: TokenForgeUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<TokenForgeUser>) => void;
  verifyEmail: (user: TokenForgeUser) => Promise<void>;
}

export interface TokenForgeAuth extends TokenForgeAuthState, TokenForgeAuthActions {}

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
