// Codes d'erreur spécifiques à l'authentification
export enum AuthErrorCode {
  // Erreurs Firebase
  INVALID_EMAIL = 'INVALID_EMAIL',
  USER_DISABLED = 'USER_DISABLED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INVALID_OPERATION = 'INVALID_OPERATION',
  SIGN_IN_ERROR = 'SIGN_IN_ERROR',
  GOOGLE_SIGN_IN_ERROR = 'GOOGLE_SIGN_IN_ERROR',
  CREATE_USER_ERROR = 'CREATE_USER_ERROR',
  RESET_PASSWORD_ERROR = 'RESET_PASSWORD_ERROR',
  UPDATE_PROFILE_ERROR = 'UPDATE_PROFILE_ERROR',
  SIGN_OUT_ERROR = 'SIGN_OUT_ERROR',
  SESSION_CHECK_ERROR = 'SESSION_CHECK_ERROR',
  SESSION_REFRESH_ERROR = 'SESSION_REFRESH_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  FIREBASE_ERROR = 'FIREBASE_ERROR',

  // Erreurs Wallet
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  NETWORK_MISMATCH = 'NETWORK_MISMATCH',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  PROVIDER_ERROR = 'PROVIDER_ERROR',

  // Erreurs Session
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
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
    public originalError?: any
  ) {
    super(`Authentication Error: ${code}`);
    this.name = 'AuthError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
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

export const createAuthError = (code: AuthErrorCode, originalError?: any): AuthError => {
  return new AuthError(code, originalError);
};

export const handleUnknownError = (error: unknown): AuthError => {
  if (error instanceof AuthError) {
    return error;
  }
  return new AuthError(AuthErrorCode.INTERNAL_ERROR, error);
};
