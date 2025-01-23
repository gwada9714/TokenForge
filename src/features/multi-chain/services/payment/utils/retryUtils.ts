import { PaymentConfig } from '../config/PaymentConfig';
import { PaymentError, PaymentErrorType } from '../types/PaymentError';

const RETRYABLE_ERRORS = [
  PaymentErrorType.NETWORK_ERROR,
  PaymentErrorType.TIMEOUT_ERROR
];

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    sessionId: string;
    maxAttempts?: number;
    initialDelay?: number;
    backoffFactor?: number;
    maxDelay?: number;
  }
): Promise<T> {
  const {
    maxAttempts = PaymentConfig.retry.maxAttempts,
    initialDelay = PaymentConfig.retry.initialDelay,
    backoffFactor = PaymentConfig.retry.backoffFactor,
    maxDelay = PaymentConfig.retry.maxDelay
  } = options;

  let attempt = 1;
  let delay = initialDelay;

  while (attempt <= maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      const paymentError = error instanceof PaymentError ? error : 
        new PaymentError(PaymentErrorType.TRANSACTION_FAILED, 'Transaction failed', error);

      if (attempt === maxAttempts || !isRetryableError(paymentError)) {
        throw paymentError;
      }

      console.warn(
        `Attempt ${attempt} failed for session ${options.sessionId}. Retrying in ${delay}ms...`,
        paymentError
      );

      await sleep(delay);
      delay = Math.min(delay * backoffFactor, maxDelay);
      attempt++;
    }
  }

  throw new PaymentError(
    PaymentErrorType.TRANSACTION_FAILED,
    `Failed after ${maxAttempts} attempts`
  );
}

function isRetryableError(error: PaymentError): boolean {
  return RETRYABLE_ERRORS.includes(error.type);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
