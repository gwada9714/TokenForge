// Codes d'erreur spécifiques à l'authentification
export const AUTH_ERROR_CODES = {
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
  NO_USER: 'AUTH_012',
  STORAGE_ERROR: 'AUTH_013',
  USER_NOT_FOUND: 'AUTH_014',
  OPERATION_NOT_ALLOWED: 'AUTH_015',
  INVALID_CREDENTIALS: 'AUTH_016',
  PROVIDER_NOT_FOUND: 'AUTH_017',
  INVALID_CONTEXT: 'AUTH_018'
} as const;

export type ErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];

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

  static CODES = AUTH_ERROR_CODES;

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
