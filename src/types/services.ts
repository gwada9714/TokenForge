import { WalletState } from "./wallet";
import { TokenForgeUser, TokenForgeAuthState } from "./auth";
import { WalletClient } from "viem";

export interface ErrorService {
  handle: (error: unknown) => void;
  handleError: (error: unknown) => Error;
  createAuthError: (code: string, message: string) => Error;
}

export interface NotificationService {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

export interface WalletReconnectionService {
  setCallbacks: (callbacks: {
    onConnect: (address: string, chainId: number) => void;
    onDisconnect: () => void;
    onNetworkChange: (chainId: number) => void;
    onError: (error: unknown) => void;
  }) => void;
  getWalletState: () => WalletState | null;
  attemptReconnection: () => Promise<void>;
  cleanup: () => void;
}

export interface SessionService {
  getUserSession: (uid: string) => Promise<{
    isAdmin: boolean;
    canCreateToken: boolean;
    canUseServices: boolean;
  } | null>;
  initSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  endSession: () => Promise<void>;
  updateActivity: () => Promise<void>;
}

export interface TokenService {
  initialize: (user: TokenForgeUser | null) => Promise<void>;
  refreshToken: () => Promise<void>;
  getToken: () => Promise<string>;
  isTokenExpired: () => boolean;
  cleanup: () => void;
}

export interface StorageService {
  // Auth Storage
  saveAuthState: (user: TokenForgeUser | null) => void;
  getAuthState: () => StoredAuthState | null;
  clearAuthState: () => void;
  getUserData: (userId: string) => Promise<StoredAuthState["user"]>;
  updateUserData: (
    userId: string,
    updates: Partial<StoredAuthState["user"]>
  ) => Promise<void>;

  // Wallet Storage
  saveWalletState: (state: Partial<WalletState>) => void;
  getWalletState: () => (Partial<WalletState> & { lastUpdate?: number }) | null;
  clearWalletState: () => void;
}

export interface TabSyncService {
  subscribe: (listener: (message: SyncMessage) => void) => () => void;
  broadcast: (message: SyncMessage) => void;
  getCurrentState: () => Map<string, any>;
  destroy: () => void;
}

export interface WalletService {
  connect: (provider?: any) => Promise<{
    address: string;
    chainId: number;
    walletClient: WalletClient;
  }>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  addNetwork: (chainId: number, networkDetails: any) => Promise<void>;
  getBalance: (address: string) => Promise<bigint>;
}

export interface AuthSyncService {
  synchronizeWalletAndAuth: (
    walletState: WalletState,
    authState: TokenForgeAuthState
  ) => Promise<void>;
  startSync: () => void;
  stopSync: () => void;
}

// Types communs
export interface StoredAuthState {
  user: TokenForgeUser | null;
  lastUpdate?: number;
}

export interface SyncMessage {
  type: "AUTH_STATE" | "WALLET_STATE" | "SESSION_STATE";
  payload: any;
  timestamp: number;
  tabId: string;
}
