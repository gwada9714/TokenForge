import { User as FirebaseUser } from 'firebase/auth';
import { PublicClient } from 'viem';
import { getWalletClient } from '@wagmi/core';
import { ErrorCode } from './errors/AuthError';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'verifying' | 'error';

export type WalletClientType = Awaited<ReturnType<typeof getWalletClient>>;

export interface TokenForgeUser extends Omit<FirebaseUser, 'metadata'> {
  isAdmin: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
    lastLoginTime?: number;
    walletAddress?: string;
    chainId?: number;
  };
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
