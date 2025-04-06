import { User } from "firebase/auth";
import { AUTH_ACTIONS } from "../features/auth/actions/authActions";
import { AuthError } from "../features/auth/errors/AuthError";
import { WalletClient } from "viem";

export interface TokenForgeUserMetadata {
  creationTime: string;
  lastSignInTime: string;
  lastLoginTime: number;
  walletAddress?: string;
  chainId?: number;
  customMetadata?: Record<string, any>;
}

export interface TokenForgeUser extends Omit<User, "metadata"> {
  metadata: TokenForgeUserMetadata;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

export enum WalletConnectionStatus {
  NO_WALLET = "NO_WALLET",
  DISCONNECTED = "DISCONNECTED",
  WRONG_NETWORK = "WRONG_NETWORK",
  CONNECTED = "CONNECTED",
}

export interface WalletConnectionState {
  isConnected: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  walletClient: WalletClient | null;
  status: WalletConnectionStatus;
}

export interface AuthState {
  status: "idle" | "loading" | "succeeded" | "failed";
  isAuthenticated: boolean;
  user: TokenForgeUser | null;
  error: AuthError | null;
  walletState: WalletConnectionState;
  hasWalletProvider?: boolean;
  walletError?: AuthError | null;
}

export const toAuthState = (user: TokenForgeUser | null): AuthState => ({
  status: user ? "succeeded" : "idle",
  isAuthenticated: !!user,
  user,
  error: null,
  walletState: {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    walletClient: null,
    status: WalletConnectionStatus.DISCONNECTED,
  },
  hasWalletProvider: false,
  walletError: null,
});

// Utiliser les constantes d'action définies dans AUTH_ACTIONS
export type AuthAction =
  // Login et Sign In Actions
  | { type: typeof AUTH_ACTIONS.LOGIN_START }
  | {
      type: typeof AUTH_ACTIONS.LOGIN_SUCCESS;
      payload: { user: TokenForgeUser; token: string };
    }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.SIGN_IN_START }
  | {
      type: typeof AUTH_ACTIONS.SIGN_IN_SUCCESS;
      payload: TokenForgeUser | null;
    }
  | { type: typeof AUTH_ACTIONS.SIGN_IN_FAILURE; payload: AuthError }

  // Sign Up Actions
  | { type: typeof AUTH_ACTIONS.SIGN_UP_START }
  | {
      type: typeof AUTH_ACTIONS.SIGN_UP_SUCCESS;
      payload: TokenForgeUser | null;
    }
  | { type: typeof AUTH_ACTIONS.SIGN_UP_FAILURE; payload: AuthError }

  // Logout Actions
  | { type: typeof AUTH_ACTIONS.LOGOUT_START }
  | { type: typeof AUTH_ACTIONS.LOGOUT_SUCCESS }
  | { type: typeof AUTH_ACTIONS.LOGOUT_FAILURE; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.LOGOUT }

  // User Update Actions
  | { type: typeof AUTH_ACTIONS.UPDATE_USER; payload: Partial<TokenForgeUser> }
  | { type: typeof AUTH_ACTIONS.UPDATE_PROFILE_START }
  | {
      type: typeof AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS;
      payload: Partial<TokenForgeUser>;
    }
  | { type: typeof AUTH_ACTIONS.UPDATE_PROFILE_FAILURE; payload: AuthError }

  // Error Management
  | { type: typeof AUTH_ACTIONS.SET_ERROR; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.CLEAR_ERROR }

  // Wallet Actions
  | { type: typeof AUTH_ACTIONS.WALLET_CONNECT; payload: WalletConnectionState }
  | { type: typeof AUTH_ACTIONS.WALLET_DISCONNECT }
  | {
      type: typeof AUTH_ACTIONS.WALLET_NETWORK_CHANGE;
      payload: { chainId: number; isCorrectNetwork: boolean };
    }
  | { type: typeof AUTH_ACTIONS.WALLET_UPDATE_PROVIDER; payload: any }
  | { type: typeof AUTH_ACTIONS.CONNECT_WALLET_START }
  | {
      type: typeof AUTH_ACTIONS.CONNECT_WALLET_SUCCESS;
      payload: WalletConnectionState;
    }
  | { type: typeof AUTH_ACTIONS.CONNECT_WALLET_FAILURE; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.DISCONNECT_WALLET_START }
  | { type: typeof AUTH_ACTIONS.DISCONNECT_WALLET_SUCCESS }
  | { type: typeof AUTH_ACTIONS.DISCONNECT_WALLET_FAILURE; payload: AuthError }

  // Password Reset Actions
  | { type: typeof AUTH_ACTIONS.RESET_PASSWORD_START }
  | { type: typeof AUTH_ACTIONS.RESET_PASSWORD_SUCCESS }
  | { type: typeof AUTH_ACTIONS.RESET_PASSWORD_FAILURE; payload: AuthError }

  // Nouvelles actions pour la gestion du provider wallet
  | {
      type: typeof AUTH_ACTIONS.SET_WALLET_PROVIDER_STATUS;
      payload: { hasWalletProvider: boolean };
    }
  | { type: typeof AUTH_ACTIONS.SET_WALLET_ERROR; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.CLEAR_WALLET_ERROR };
