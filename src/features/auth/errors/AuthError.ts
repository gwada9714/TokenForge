// Codes d'erreur spécifiques à l'authentification
export const AUTH_ERROR_CODES = {
  WALLET_NOT_FOUND: 'AUTH_001',
  NETWORK_MISMATCH: 'AUTH_002',
  INVALID_SIGNATURE: 'AUTH_003',
  SESSION_EXPIRED: 'AUTH_004',
  FIREBASE_ERROR: 'AUTH_005',
  SIGN_IN_ERROR: 'AUTH_006',
  SIGN_OUT_ERROR: 'AUTH_007',
  CREATE_USER_ERROR: 'AUTH_008',
  UPDATE_PROFILE_ERROR: 'AUTH_009',
  DELETE_USER_ERROR: 'AUTH_010',
  USER_NOT_FOUND: 'AUTH_011',
  INVALID_TOKEN: 'AUTH_012',
  INVALID_CREDENTIALS: 'AUTH_013',
  SESSION_CHECK_ERROR: 'AUTH_014',
  USER_DISABLED: 'AUTH_015',
  SESSION_REFRESH_ERROR: 'AUTH_016',
  UNKNOWN_ERROR: 'AUTH_999'
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_CODES;

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  originalError?: unknown;
}

export class AuthErrorClass extends Error {
  public readonly code: AuthErrorCode;
  public readonly originalError?: unknown;

  constructor(code: AuthErrorCode, message: string, originalError?: unknown) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.originalError = originalError;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      originalError: this.originalError
    };
  }
}

export const createAuthError = (code: AuthErrorCode, originalError?: unknown): AuthErrorClass => {
  const message = getErrorMessage(code);
  return new AuthErrorClass(code, message, originalError);
};

const getErrorMessage = (code: AuthErrorCode): string => {
  switch (code) {
    case AUTH_ERROR_CODES.WALLET_NOT_FOUND:
      return 'Wallet non trouvé';
    case AUTH_ERROR_CODES.NETWORK_MISMATCH:
      return 'Réseau incompatible';
    case AUTH_ERROR_CODES.INVALID_SIGNATURE:
      return 'Signature invalide';
    case AUTH_ERROR_CODES.SESSION_EXPIRED:
      return 'Session expirée';
    case AUTH_ERROR_CODES.FIREBASE_ERROR:
      return 'Erreur Firebase';
    case AUTH_ERROR_CODES.SIGN_IN_ERROR:
      return 'Erreur de connexion';
    case AUTH_ERROR_CODES.SIGN_OUT_ERROR:
      return 'Erreur de déconnexion';
    case AUTH_ERROR_CODES.CREATE_USER_ERROR:
      return 'Erreur lors de la création de l\'utilisateur';
    case AUTH_ERROR_CODES.UPDATE_PROFILE_ERROR:
      return 'Erreur lors de la mise à jour du profil';
    case AUTH_ERROR_CODES.DELETE_USER_ERROR:
      return 'Erreur lors de la suppression de l\'utilisateur';
    case AUTH_ERROR_CODES.USER_NOT_FOUND:
      return 'Utilisateur non trouvé';
    case AUTH_ERROR_CODES.INVALID_TOKEN:
      return 'Token invalide';
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      return 'Informations d\'identification invalides';
    case AUTH_ERROR_CODES.SESSION_CHECK_ERROR:
      return 'Erreur de vérification de session';
    case AUTH_ERROR_CODES.USER_DISABLED:
      return 'Utilisateur désactivé';
    case AUTH_ERROR_CODES.SESSION_REFRESH_ERROR:
      return 'Erreur de rafraîchissement de session';
    default:
      return 'Erreur inconnue';
  }
};

export class AuthComponentNotRegisteredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthComponentNotRegisteredError';
  }
}

export class FatalAuthError extends Error {
  constructor(code: AuthErrorCode) {
    super(`Erreur fatale d'authentification: ${code}`);
    this.name = 'FatalAuthError';
  }
}

export class AuthIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthIntegrityError';
  }
}
