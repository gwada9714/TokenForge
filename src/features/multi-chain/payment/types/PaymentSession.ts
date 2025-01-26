export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}

export enum PaymentNetwork {
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM'
}

export interface PaymentOptions {
  skipPreflight?: boolean;
  commitment?: 'finalized' | 'processed' | 'confirmed';
}

export interface PaymentSession {
  id: string;
  userId: string;
  amount: bigint;
  status: PaymentStatus;
  network: PaymentNetwork;
  serviceType: string;
  transactionHash?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  retryCount: number;
  options: PaymentOptions;
}
