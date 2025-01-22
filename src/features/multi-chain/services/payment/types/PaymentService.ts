import { PublicKey } from '@solana/web3.js';
import { Address } from 'viem';

export interface PaymentOptions {
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  slippage?: number;
  deadline?: number;
  skipPreflight?: boolean;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export type PaymentAmount = number | bigint;

export interface BasePaymentService {
  /**
   * Process a payment with a specific token
   * @param tokenAddress - The address of the token (Address for EVM chains, PublicKey for Solana)
   * @param amount - The payment amount (as bigint)
   * @param serviceType - The type of service being paid for
   * @param userId - The ID of the user making the payment
   * @param options - Additional payment options
   * @returns Promise with the transaction hash or signature
   */
  payWithToken(
    tokenAddress: Address | PublicKey,
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string>;

  /**
   * Check if a token is supported for payments
   * @param tokenAddress - The address of the token to check
   */
  isTokenSupported(tokenAddress: Address | PublicKey): Promise<boolean>;
}
