import { PublicKey } from '@solana/web3.js';
import { Address } from 'viem';
import { PaymentAmount } from '../types/PaymentService';
import { PaymentError, PaymentErrorType } from '../types/PaymentError';

const MAX_AMOUNT = BigInt('1000000000000000000000000'); // 1M tokens avec 18 decimals
const MIN_AMOUNT = BigInt('100000'); // 0.1 tokens avec 18 decimals

/**
 * Validates payment parameters
 * @param tokenAddress - The token address to validate
 * @param amount - The payment amount to validate
 * @param userId - The user ID to validate
 * @throws PaymentError if validation fails
 */
export function validatePaymentParams(
  tokenAddress: Address | PublicKey,
  amount: PaymentAmount,
  userId: string
): void {
  try {
    // Validate token address
    if (!tokenAddress) {
      throw new PaymentError(
        PaymentErrorType.VALIDATION_ERROR,
        'Token address is required'
      );
    }

    // Validate amount
    if (typeof amount === 'bigint') {
      if (amount <= 0n) {
        throw new PaymentError(
          PaymentErrorType.VALIDATION_ERROR,
          'Payment amount must be greater than 0'
        );
      }
      if (amount > MAX_AMOUNT) {
        throw new PaymentError(
          PaymentErrorType.VALIDATION_ERROR,
          'Payment amount exceeds maximum allowed'
        );
      }
      if (amount < MIN_AMOUNT) {
        throw new PaymentError(
          PaymentErrorType.VALIDATION_ERROR,
          'Payment amount is below minimum allowed'
        );
      }
    } else if (amount <= 0) {
      throw new PaymentError(
        PaymentErrorType.VALIDATION_ERROR,
        'Payment amount must be greater than 0'
      );
    }

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new PaymentError(
        PaymentErrorType.VALIDATION_ERROR,
        'Valid user ID is required'
      );
    }
  } catch (error) {
    if (error instanceof PaymentError) {
      throw error;
    }
    throw new PaymentError(
      PaymentErrorType.VALIDATION_ERROR,
      'Payment validation failed',
      error
    );
  }
}

/**
 * Validates wallet state for payment
 * @param balance - Current wallet balance
 * @param requiredAmount - Amount required for the transaction
 * @param estimatedFees - Estimated transaction fees
 * @throws PaymentError if validation fails
 */
export function validateWalletState(
  balance: bigint,
  requiredAmount: bigint,
  estimatedFees: bigint = BigInt(0)
): void {
  const totalRequired = requiredAmount + estimatedFees;

  if (balance < totalRequired) {
    throw new PaymentError(
      PaymentErrorType.INSUFFICIENT_FUNDS,
      'Insufficient funds for transaction',
      {
        balance,
        required: totalRequired,
        missing: totalRequired - balance
      }
    );
  }
}

/**
 * Validates transaction parameters
 * @param gasLimit - Gas limit for the transaction (EVM only)
 * @param gasPrice - Gas price for the transaction (EVM only)
 * @throws PaymentError if validation fails
 */
export function validateTransactionParams(
  gasLimit?: bigint,
  gasPrice?: bigint
): void {
  if (gasLimit && gasLimit <= BigInt(21000)) {
    throw new PaymentError(
      PaymentErrorType.VALIDATION_ERROR,
      'Gas limit is too low',
      { gasLimit }
    );
  }

  if (gasPrice && gasPrice <= BigInt(0)) {
    throw new PaymentError(
      PaymentErrorType.VALIDATION_ERROR,
      'Invalid gas price',
      { gasPrice }
    );
  }
}
