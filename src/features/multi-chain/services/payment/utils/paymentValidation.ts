import { PublicKey } from '@solana/web3.js';
import { Address } from 'viem';
import { PaymentAmount } from '../types/PaymentService';

/**
 * Validates payment parameters
 * @param tokenAddress - The token address to validate
 * @param amount - The payment amount to validate
 * @param userId - The user ID to validate
 * @throws Error if validation fails
 */
export function validatePaymentParams(
  tokenAddress: Address | PublicKey,
  amount: PaymentAmount,
  userId: string
): void {
  // Validate token address
  if (!tokenAddress) {
    throw new Error('Token address is required');
  }

  // Validate amount
  if (typeof amount === 'bigint') {
    if (amount <= 0n) {
      throw new Error('Payment amount must be greater than 0');
    }
  } else if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  // Validate userId
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Valid user ID is required');
  }
}
