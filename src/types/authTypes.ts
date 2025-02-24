import { User } from 'firebase/auth';

export interface TokenForgeUserMetadata {
  creationTime: string;
  lastSignInTime: string;
  lastLoginTime: number;
  walletAddress?: string;
  chainId?: number;
  customMetadata?: Record<string, any>;
}

export interface TokenForgeUser extends Omit<User, 'metadata'> {
  metadata: TokenForgeUserMetadata;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface WalletConnectionState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}

export interface AuthState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  walletState: WalletConnectionState;
}

export const toAuthState = (user: TokenForgeUser | null): AuthState => ({
  status: user ? 'succeeded' : 'idle',
  isAuthenticated: !!user,
  user,
  error: null,
  walletState: {
    isConnected: false,
    address: null,
    chainId: null
  }
});

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: TokenForgeUser }
  | { type: 'LOGIN_FAILURE'; payload: AuthError }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<TokenForgeUser> }
  | { type: 'UPDATE_WALLET'; payload: { address: string | null; isConnected: boolean } }
  | { type: 'SET_ERROR'; payload: AuthError }
  | { type: 'CLEAR_ERROR' };
