import { User as FirebaseUser } from 'firebase/auth';
import { JsonRpcSigner } from 'ethers';
import type { PublicClient } from 'viem';
import { AuthError } from '../errors/AuthError';
import type { Dispatch } from 'react';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface TokenForgeMetadata {
  creationTime: string;
  lastSignInTime: string;
  lastLoginTime?: number;
  walletAddress?: string;
  chainId?: number;
  customMetadata: Record<string, unknown>;
}

export interface TokenForgeUser extends Omit<FirebaseUser, 'metadata'> {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  metadata: TokenForgeMetadata;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  provider: PublicClient | null;
  walletClient: JsonRpcSigner | null;
}

export interface TokenForgeAuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  walletState: WalletState;
}

export type AuthAction = 
  | { type: 'auth/loginStart' }
  | { type: 'auth/loginSuccess'; payload: TokenForgeUser }
  | { type: 'auth/loginFailure'; payload: AuthError }
  | { type: 'auth/logout' }
  | { type: 'auth/setError'; payload: AuthError }
  | { type: 'auth/clearError' }
  | { type: 'auth/updateUser'; payload: Partial<TokenForgeUser> }
  | { type: 'auth/connectWallet'; payload: WalletState }
  | { type: 'auth/disconnectWallet' };

export interface TokenForgeAuthContextValue extends TokenForgeAuthState {
  dispatch: Dispatch<AuthAction>;
}
