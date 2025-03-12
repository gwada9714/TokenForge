import { User as FirebaseUser } from 'firebase/auth';
import { AuthError } from '../errors/AuthError';
import { WalletClient } from 'viem';
import { AuthAction } from '../../../types/authTypes';

export type AuthStatus = 
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'error'
  | 'wallet_connected'
  | 'wallet_connected_auth_pending'
  | 'wallet_connected_wrong_network';

export interface TokenForgeUser extends FirebaseUser {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
    lastLoginTime: number;
    walletAddress?: string;
    chainId?: number;
    customMetadata?: Record<string, any>;
  };
}

export interface WalletState {
  address: `0x${string}` | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  chainId: number | null;
  walletClient: WalletClient | null;
}

export interface TokenForgeAuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  wallet: WalletState;
  loading: boolean;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  hasWalletProvider: boolean;
  walletError: AuthError | null;
}

export interface SessionData {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  walletAddress?: string;
  chainId?: number;
  lastLoginTime?: number;
}

export interface NotificationEvent {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  data?: any;
}

export interface TokenForgeAuthContextValue {
  isInitialized: boolean;
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  wallet: WalletState;
  loading: boolean;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  hasWalletProvider: boolean;
  walletError: AuthError | null;
  dispatch: React.Dispatch<AuthAction>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  updateUser: (updates: Partial<TokenForgeUser>) => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  clearError: () => void;
  clearWalletError: () => void;
  validateAdminAccess: () => boolean;
}
