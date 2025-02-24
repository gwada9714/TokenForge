// Codes d'erreur spécifiques à l'authentification
export enum AuthErrorCode {
  NOT_INITIALIZED = 'auth/not-initialized',
  INVALID_CREDENTIALS = 'auth/invalid-credentials',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  WEAK_PASSWORD = 'auth/weak-password',
  INVALID_EMAIL = 'auth/invalid-email',
  INTERNAL_ERROR = 'auth/internal-error',
  NETWORK_ERROR = 'auth/network-error',

  // Erreurs Wallet
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  NETWORK_MISMATCH = 'NETWORK_MISMATCH',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  PROVIDER_ERROR = 'PROVIDER_ERROR',

  // Erreurs Session
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_VERIFICATION_CODE = 'INVALID_VERIFICATION_CODE',
  INVALID_VERIFICATION_ID = 'INVALID_VERIFICATION_ID',
  REQUIRES_RECENT_LOGIN = 'REQUIRES_RECENT_LOGIN',

  // Erreurs Storage
  PERSISTENCE_ERROR = 'PERSISTENCE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',

  // Erreur générique
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      stack: this.stack
    };
  }
}

export class AuthComponentNotRegisteredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthComponentNotRegisteredError';
  }
}

export class AuthIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthIntegrityError';
  }
}

export const createAuthError = (code: AuthErrorCode, message: string, originalError?: unknown): AuthError => {
  return new AuthError(code, message, originalError);
};

export const handleUnknownError = (error: unknown): AuthError => {
  if (error instanceof AuthError) {
    return error;
  }
  return new AuthError(AuthErrorCode.INTERNAL_ERROR, 'Erreur inconnue', error);
};
