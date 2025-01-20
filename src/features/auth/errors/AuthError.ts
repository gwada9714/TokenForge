import { ErrorCode } from '../../../types/errors';

export class AuthError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  static CODES = {
    WALLET_NOT_FOUND: 'AUTH_001',
    NETWORK_MISMATCH: 'AUTH_002',
    INVALID_SIGNATURE: 'AUTH_003',
    SESSION_EXPIRED: 'AUTH_004',
    FIREBASE_ERROR: 'AUTH_005',
    TWO_FACTOR_REQUIRED: 'AUTH_006',
    TWO_FACTOR_INVALID: 'AUTH_007',
    WALLET_DISCONNECTED: 'AUTH_008',
    PROVIDER_ERROR: 'AUTH_009',
    EMAIL_NOT_VERIFIED: 'AUTH_010',
    EMAIL_VERIFICATION_TIMEOUT: 'AUTH_011',
  } as const;

  static create(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ): AuthError {
    return new AuthError(code, message, details);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export const createAuthError = (
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): AuthError => {
  return AuthError.create(code, message, details);
};
