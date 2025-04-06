export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isConnected?: () => boolean;
  selectedAddress?: string | null;
  networkVersion?: string;
}

export interface EthereumError extends Error {
  code: string | number;
  data?: unknown;
}

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogMessage {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface AuthErrorCode {
  SESSION_NOT_FOUND: "auth/session-not-found";
  SESSION_INVALID: "auth/session-invalid";
  SESSION_EXPIRED: "SESSION_EXPIRED";
  WALLET_NOT_FOUND: "auth/wallet-not-found";
  WALLET_DISCONNECTED: "WALLET_DISCONNECTED";
  NETWORK_NOT_SUPPORTED: "auth/network-not-supported";
}
