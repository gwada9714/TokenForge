import { getWalletClient } from '@wagmi/core';
import { User as FirebaseUser } from 'firebase/auth';
import { ErrorCode } from '../../types/errors';

export type WalletClientType = Awaited<ReturnType<typeof getWalletClient>>;

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

// Utilise directement le type ErrorCode global qui inclut maintenant nos codes spécifiques
export type { ErrorCode };

export interface AuthError extends Error {
  code: ErrorCode;
  details?: Record<string, unknown>;
}

// Type pour représenter un utilisateur Firebase avec des champs supplémentaires
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
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  loading: boolean;
  error: AuthError | null;
  emailVerified: boolean;
}

export interface TokenForgeAuthState extends Omit<AuthState, 'loading'> {
  status: AuthStatus;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  
  // Wallet state
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  walletClient: WalletClientType | null;
  isCorrectNetwork: boolean;
  provider: any;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}

export const AUTH_ACTIONS = {
  LOGIN_START: 'auth/loginStart',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  LOGOUT: 'auth/logout',
  UPDATE_USER: 'auth/updateUser',
  EMAIL_VERIFICATION_START: 'auth/emailVerificationStart',
  EMAIL_VERIFICATION_SUCCESS: 'auth/emailVerificationSuccess',
  EMAIL_VERIFICATION_FAILURE: 'auth/emailVerificationFailure',
  WALLET_CONNECT: 'auth/walletConnect',
  WALLET_DISCONNECT: 'auth/walletDisconnect',
  NETWORK_CHANGE: 'auth/networkChange',
} as const;

export type AuthAction =
  | { type: typeof AUTH_ACTIONS.LOGIN_START }
  | { type: typeof AUTH_ACTIONS.LOGIN_SUCCESS; payload: TokenForgeUser }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; error: AuthError }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.UPDATE_USER; payload: TokenForgeUser }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_START }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS }
  | { type: typeof AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE; error: AuthError }
  | { type: typeof AUTH_ACTIONS.WALLET_CONNECT }
  | { type: typeof AUTH_ACTIONS.WALLET_DISCONNECT }
  | { type: typeof AUTH_ACTIONS.NETWORK_CHANGE; payload: number };
