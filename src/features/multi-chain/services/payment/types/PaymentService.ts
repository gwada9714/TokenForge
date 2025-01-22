import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'ethers';
import { PaymentToken } from './PaymentSession';

export interface PaymentOptions {
  gasLimit?: number;
  gasPrice?: number | BigNumber;
  slippage?: number;
  deadline?: number;
  skipPreflight?: boolean;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export type PaymentAmount = number | BigNumber;

export interface BasePaymentService {
  /**
   * Process a payment with a specific token
   * @param tokenAddress - The address of the token (string for EVM chains, PublicKey for Solana)
   * @param amount - The payment amount (number for Solana, BigNumber for EVM chains)
   * @param serviceType - The type of service being paid for
   * @param userId - The ID of the user making the payment
   * @param options - Additional payment options
   * @returns Promise with the transaction hash or signature
   */
  payWithToken(
    tokenAddress: string | PublicKey,
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string>;

  /**
   * Validate if a token is supported for payment
   * @param tokenAddress - The address of the token to check
   * @returns Promise indicating if the token is supported
   */
  isTokenSupported?(tokenAddress: string | PublicKey): Promise<boolean>;
}
