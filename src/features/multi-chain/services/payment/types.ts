export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED'
}

export enum PaymentNetwork {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  BINANCE = 'BINANCE',
  SOLANA = 'SOLANA'
}

export interface PaymentToken {
  address: string;
  symbol: string;
  decimals: number;
  network: PaymentNetwork;
}

export interface PaymentSession {
  id: string;
  userId: string;
  status: PaymentStatus;
  network: PaymentNetwork;
  token: PaymentToken;
  amount: string;
  txHash?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
  retryCount: number;
  metadata?: Record<string, unknown>;
}

export interface PaymentSessionOptions {
  timeout?: number;
  maxRetries?: number;
  metadata?: Record<string, unknown>;
}

export interface PaymentError extends Error {
  code: string;
  details?: unknown;
} 