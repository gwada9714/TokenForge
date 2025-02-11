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

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: TokenForgeUser }
  | { type: 'LOGIN_FAILURE'; payload: AuthError }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<TokenForgeUser> }
  | { type: 'UPDATE_WALLET'; payload: { address: string | null; isConnected: boolean } }
  | { type: 'SET_ERROR'; payload: AuthError }
  | { type: 'CLEAR_ERROR' };
