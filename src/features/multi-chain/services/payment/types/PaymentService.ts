import { PublicKey } from '@solana/web3.js';

export interface PaymentOptions {
  gasLimit?: number;
  gasPrice?: number;
  slippage?: number;
  deadline?: number;
  skipPreflight?: boolean;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface BasePaymentService {
  payWithToken(
    tokenAddress: string | PublicKey,
    amount: number,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string>;
}
