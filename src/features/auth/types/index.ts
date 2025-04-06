import { User as FirebaseUser } from "firebase/auth";
import { JsonRpcSigner } from "ethers";
import type { PublicClient } from "viem";
import { AuthError } from "../errors/AuthError";
import type { Dispatch } from "react";

export * from "../schemas/auth.schema";

export enum AuthProvider {
  EMAIL = "email",
  GOOGLE = "google",
  GITHUB = "github",
  METAMASK = "metamask",
}

export enum AuthEventType {
  SIGN_IN = "sign_in",
  SIGN_OUT = "sign_out",
  TOKEN_REFRESH = "token_refresh",
  SESSION_EXPIRED = "session_expired",
  PROFILE_UPDATE = "profile_update",
}

export interface AuthEvent {
  type: AuthEventType;
  timestamp: number;
  userId?: string;
  provider?: AuthProvider;
  metadata?: Record<string, unknown>;
}

export interface AuthConfig {
  sessionTimeout: number;
  refreshThreshold: number;
  maxRetries: number;
  retryDelay: number;
  persistenceType: "local" | "session" | "none";
}

export interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: AuthError | null;
  signIn: (provider: AuthProvider, credentials?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface UseAuthStateReturn {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}

export interface TokenForgeUser extends Omit<FirebaseUser, "metadata"> {
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
  | { type: "auth/loginStart" }
  | { type: "auth/loginSuccess"; payload: TokenForgeUser }
  | { type: "auth/loginFailure"; payload: AuthError }
  | { type: "auth/logout" }
  | { type: "auth/setError"; payload: AuthError }
  | { type: "auth/clearError" }
  | { type: "auth/updateUser"; payload: Partial<TokenForgeUser> }
  | { type: "auth/connectWallet"; payload: WalletState }
  | { type: "auth/disconnectWallet" };

export interface TokenForgeAuthContextValue extends TokenForgeAuthState {
  dispatch: Dispatch<AuthAction>;
}
