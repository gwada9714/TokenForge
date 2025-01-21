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
  INVALID_CONTEXT: 'AUTH_018',
  ADMIN_ERROR: 'AUTH_019',
  SESSION_ERROR: 'AUTH_020',
  SYNC_ERROR: 'AUTH_021',
  UNKNOWN_ERROR: 'AUTH_999'
} as const;

export type ErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];

export class AuthError extends Error {
  public readonly details: Record<string, unknown>;

  constructor(
    public readonly code: ErrorCode,
    message: string,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AuthError';
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}

export function createAuthError(
  code: ErrorCode,
  message: string,
  details: Record<string, unknown> = {}
): AuthError {
  return new AuthError(code, message, details);
}
