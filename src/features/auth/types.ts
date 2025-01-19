import { User } from 'firebase/auth';
import { getWalletClient } from '@wagmi/core';

export type WalletClientType = Awaited<ReturnType<typeof getWalletClient>>;

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  walletClient: WalletClientType | null;
}

export interface TokenForgeAuthState extends AuthState, WalletState {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  signOut: () => Promise<void>;
  
  // Actions
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  setError: (error: AuthError) => void;
}

export interface User extends firebase.auth.UserCredential['user'] {
  email: string;
  isAdmin?: boolean;
}

export interface AuthError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

export interface AuthAction {
  type: string;
  payload?: any;
  error?: AuthError;
}

// Constants pour les actions
export const AUTH_ACTIONS = {
  LOGIN_START: 'auth/loginStart',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  LOGOUT: 'auth/logout',
  WALLET_CONNECT: 'auth/walletConnect',
  WALLET_DISCONNECT: 'auth/walletDisconnect',
  NETWORK_CHANGE: 'auth/networkChange',
  UPDATE_USER: 'auth/updateUser',
} as const;
