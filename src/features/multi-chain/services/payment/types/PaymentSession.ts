import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'ethers';

export enum PaymentNetwork {
  ETHEREUM = 'ETHEREUM',
  BINANCE = 'BINANCE',
  POLYGON = 'POLYGON',
  SOLANA = 'SOLANA',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  TIMEOUT = 'TIMEOUT'
}

export interface PaymentToken {
  address: string | PublicKey;
  network: PaymentNetwork;
  symbol: string;
  decimals: number;
}

export interface PaymentSession {
  id: string;
  userId: string;
  status: PaymentStatus;
  network: PaymentNetwork;
  token: PaymentToken;
  amount: BigNumber;
  serviceType: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  txHash?: string;
  error?: string;
  retryCount: number;
}
