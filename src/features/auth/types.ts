import { User as FirebaseUser } from 'firebase/auth';
import { PublicClient } from 'viem';
import { getWalletClient } from '@wagmi/core';
import { ErrorCode } from './errors/AuthError';

export type AuthStatus = 
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'wallet_connected'
  | 'wallet_connected_auth_pending'
  | 'wallet_connected_wrong_network'
  | 'error';

export type WalletClientType = Awaited<ReturnType<typeof getWalletClient>>;

export interface TokenForgeUser extends Omit<FirebaseUser, 'metadata'> {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
    lastLoginTime?: number;
    walletAddress?: string;
    chainId?: number;
  };
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  customMetadata?: Record<string, unknown>;
  lastLoginTime?: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  provider: PublicClient | null;
  walletClient: WalletClientType | null;
}

export interface AuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  walletState: WalletState;
}

export interface TokenForgeAuthState extends AuthState {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

export interface TokenForgeAuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<TokenForgeUser>) => void;
}

export interface TokenForgeAuth extends TokenForgeAuthState {
  actions: TokenForgeAuthActions;
  validateAdminAccess: () => boolean;
}

export interface TokenForgeAuthContextValue extends TokenForgeAuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  clearError: () => void;
}

export interface AuthError {
  name: string;
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  toJSON(): { name: string; code: ErrorCode; message: string; details?: Record<string, unknown> };
}

export interface SessionService {
  initializeSession: (callback: (user: FirebaseUser | null) => void) => () => void;
  refreshSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export interface WalletReconnectionService {
  isCorrectNetwork: (chainId: number) => boolean;
  reconnect: () => Promise<void>;
  disconnect: () => Promise<void>;
}
