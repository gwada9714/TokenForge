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
  TOO_MANY_ATTEMPTS = 'auth/too-many-attempts',
  ACCOUNT_DISABLED = 'auth/user-disabled',
  USER_NOT_LOGGED_IN = 'auth/user-not-logged-in',
  
  // Nouveaux codes d'erreur
  AUTHENTICATION_ERROR = 'auth/authentication-error',
  SIGNOUT_ERROR = 'auth/signout-error',
  RESET_PASSWORD_ERROR = 'auth/reset-password-error',
  UPDATE_PROFILE_ERROR = 'auth/update-profile-error',
  SIGNUP_FAILED = 'auth/signup-failed',
  LOGOUT_FAILED = 'auth/logout-failed',
  RESET_PASSWORD_FAILED = 'auth/reset-password-failed',
  UPDATE_PROFILE_FAILED = 'auth/update-profile-failed',
  UPDATE_USER_FAILED = 'auth/update-user-failed',

  // Erreurs Wallet
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  NETWORK_MISMATCH = 'NETWORK_MISMATCH',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  WRONG_NETWORK = 'WALLET_WRONG_NETWORK',
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR',
  WALLET_DISCONNECTION_ERROR = 'WALLET_DISCONNECTION_ERROR',
  WALLET_CONNECTION_FAILED = 'WALLET_CONNECTION_FAILED',
  WALLET_DISCONNECTION_FAILED = 'WALLET_DISCONNECTION_FAILED',
  NO_WALLET_PROVIDER = 'NO_WALLET_PROVIDER',
  USER_REJECTED_REQUEST = 'USER_REJECTED_REQUEST',

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
