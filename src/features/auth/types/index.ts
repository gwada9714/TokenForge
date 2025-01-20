import { User as FirebaseUser } from 'firebase/auth';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { AuthError } from '../errors/AuthError';

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
  provider: BrowserProvider | null;
  walletClient: JsonRpcSigner | null;
}

export interface TokenForgeAuthState extends AuthState {
  walletState: WalletState;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

export interface TokenForgeMetadata {
  creationTime: string | null;
  lastSignInTime: string | null;
  lastLoginTime: number | null;
  walletAddress: string | null;
  chainId: number | null;
  customMetadata?: Record<string, unknown>;
}

export interface TokenForgeUser extends Omit<FirebaseUser, 'metadata'> {
  isAdmin: boolean;
  metadata: TokenForgeMetadata;
}

export interface TokenForgeAuth extends TokenForgeAuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<TokenForgeUser>) => Promise<void>;
}

export interface AuthSession {
  user: TokenForgeUser;
  token: string;
  expiresAt: number;
}

export interface NetworkState {
  isChanging: boolean;
  error: Error | null;
  lastAttemptedChainId: number | null;
}

export type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: TokenForgeUser }
  | { type: 'LOGIN_FAILURE'; payload: AuthError }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<TokenForgeUser> }
  | { type: 'UPDATE_NETWORK'; payload: { chainId: number; isCorrectNetwork: boolean } };
