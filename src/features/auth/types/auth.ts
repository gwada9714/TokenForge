import { User as FirebaseUser } from 'firebase/auth';
import { AuthError } from '../errors/AuthError';

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
  provider: any;
  walletClient: any;
}

export interface TokenForgeAuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  walletState: WalletState;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

export interface SessionData {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  metadata?: {
    walletAddress?: string;
    chainId?: number;
    customMetadata?: Record<string, any>;
  };
}

export interface NotificationEvent {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  data?: any;
}

export interface AuthContextValue extends TokenForgeAuthState {
  dispatch: React.Dispatch<any>;
}
