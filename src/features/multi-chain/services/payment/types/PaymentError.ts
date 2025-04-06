export enum PaymentErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  SESSION_ERROR = "SESSION_ERROR",
  WALLET_ERROR = "WALLET_ERROR",
}

export class PaymentError extends Error {
  constructor(
    public type: PaymentErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export const createPaymentError = (
  type: PaymentErrorType,
  message: string,
  details?: any
): PaymentError => {
  return new PaymentError(type, message, details);
};
