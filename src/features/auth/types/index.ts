import { User as FirebaseUser } from 'firebase/auth';
import { JsonRpcSigner } from 'ethers';
import type { PublicClient } from 'viem';
import { AuthError } from '../errors/AuthError';
import { authActions } from '../actions/authActions';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  provider: PublicClient | null;
  walletClient: JsonRpcSigner | null;
}

export interface TokenForgeMetadata {
  creationTime?: string | undefined;
  lastSignInTime?: string | undefined;
  lastLoginTime?: number | undefined;
  walletAddress?: string | undefined;
  chainId?: number | undefined;
  customMetadata: Record<string, unknown>;
}

export interface TokenForgeUser extends Omit<FirebaseUser, 'metadata'> {
  isAdmin: boolean;
  metadata: TokenForgeMetadata;
}

export interface TokenForgeAuthState extends AuthState {
  walletState: WalletState;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

export interface TokenForgeAuthMethods {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<TokenForgeUser>) => Promise<void>;
}

export interface TokenForgeAuth extends TokenForgeAuthState, TokenForgeAuthMethods {
  actions: typeof authActions;
}
