import { BigNumber } from 'ethers';
import { PaymentAmount, PaymentOptions } from '../types/PaymentService';

/**
 * Validates payment parameters
 * @param amount - The payment amount to validate
 * @param options - The payment options to validate
 * @throws Error if validation fails
 */
export function validatePaymentParams(amount: PaymentAmount, options: PaymentOptions): void {
  // Validate amount
  if (amount instanceof BigNumber) {
    if (amount.lte(0)) {
      throw new Error('Payment amount must be greater than 0');
    }
  } else if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  // Validate options
  if (options.slippage !== undefined) {
    if (options.slippage < 0 || options.slippage > 100) {
      throw new Error('Slippage must be between 0 and 100');
    }
  }

  if (options.deadline !== undefined && options.deadline < Date.now()) {
    throw new Error('Deadline must be in the future');
  }

  if (options.gasLimit !== undefined && options.gasLimit <= 0) {
    throw new Error('Gas limit must be greater than 0');
  }

  if (options.gasPrice !== undefined) {
    if (options.gasPrice instanceof BigNumber) {
      if (options.gasPrice.lt(0)) {
        throw new Error('Gas price cannot be negative');
      }
    } else if (options.gasPrice < 0) {
      throw new Error('Gas price cannot be negative');
    }
  }
}
