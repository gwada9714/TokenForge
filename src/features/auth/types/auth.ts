import { User as FirebaseUser } from 'firebase/auth';
import { AuthError } from '../errors/AuthError';
import { TokenForgeAuthActions } from '../actions/authActions';
import { WalletClient } from 'viem';

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
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  walletClient: WalletClient | null;
}

export interface TokenForgeAuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  wallet: WalletState;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
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
  state: TokenForgeAuthState;
  dispatch: React.Dispatch<any>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  updateUser: (updates: Partial<TokenForgeUser>) => Promise<void>;
  connectWallet: (address: string, chainId: number, walletClient: WalletClient) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  clearError: () => void;
  actions: TokenForgeAuthActions;
  validateAdminAccess: () => boolean;
}

export interface AuthContextValue {
  dispatch: React.Dispatch<any>;
}
