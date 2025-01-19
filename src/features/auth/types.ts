import { getWalletClient } from '@wagmi/core';

export type WalletClientType = Awaited<ReturnType<typeof getWalletClient>>;

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

export interface User {
  uid: string;
  email: string | null;
  isAdmin?: boolean;
  displayName?: string | null;
  photoURL?: string | null;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  walletClient: WalletClientType | null;
}

export interface TokenForgeAuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: User | null;
  error: AuthError | null;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  signOut: () => Promise<void>;
  
  // Wallet state
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  walletClient: WalletClientType | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setError: (error: AuthError) => void;
  updateUser: (user: User) => void;
}

export interface TokenForgeAuthContextValue extends TokenForgeAuthState {
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // Wallet methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
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
