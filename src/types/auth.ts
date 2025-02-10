import { WalletState } from '../features/auth/types/wallet';
import { WalletClient } from 'viem';

export interface TokenForgeUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
    lastLoginTime: number;
  };
}

export interface TokenForgeAuthState {
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  isAuthenticated: boolean;
  loading: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  wallet: WalletState;
}

export interface AuthError extends Error {
  code?: string;
  details?: unknown;
  toJSON: () => object;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}

export interface TokenForgeAuthContextValue {
  state: TokenForgeAuthState;
  actions: AuthActions;
}
