import { AuthError as FirebaseAuthError } from 'firebase/auth';
import { createAuthError } from '../errors/AuthError';
import { AUTH_ERROR_CODES } from '../errors/AuthError';
import { logger, LogLevel } from '@/utils/logger';

interface FirebaseErrorMapping {
  code: keyof typeof AUTH_ERROR_CODES;
  message: string;
}

const FIREBASE_ERROR_MAP: Record<string, FirebaseErrorMapping> = {
  'auth/invalid-email': {
    code: 'SIGN_IN_ERROR',
    message: 'L\'adresse email est invalide.'
  },
  'auth/user-disabled': {
    code: 'USER_NOT_FOUND',
    message: 'Ce compte a été désactivé.'
  },
  'auth/user-not-found': {
    code: 'USER_NOT_FOUND',
    message: 'Aucun compte ne correspond à cet email.'
  },
  'auth/wrong-password': {
    code: 'SIGN_IN_ERROR',
    message: 'Le mot de passe est incorrect.'
  },
  'auth/email-already-in-use': {
    code: 'CREATE_USER_ERROR',
    message: 'Cette adresse email est déjà utilisée.'
  },
  'auth/operation-not-allowed': {
    code: 'SERVICE_NOT_INITIALIZED',
    message: 'Cette opération n\'est pas autorisée.'
  },
  'auth/weak-password': {
    code: 'CREATE_USER_ERROR',
    message: 'Le mot de passe est trop faible.'
  },
  'auth/invalid-credential': {
    code: 'INVALID_TOKEN',
    message: 'Les informations d\'identification sont invalides.'
  },
  'auth/invalid-verification-code': {
    code: 'INVALID_TOKEN',
    message: 'Le code de vérification est invalide.'
  },
  'auth/invalid-verification-id': {
    code: 'INVALID_TOKEN',
    message: 'L\'identifiant de vérification est invalide.'
  },
  'auth/requires-recent-login': {
    code: 'SESSION_EXPIRED',
    message: 'Cette opération nécessite une connexion récente. Veuillez vous reconnecter.'
  }
};

export const mapFirebaseError = (error: FirebaseAuthError) => {
  const firebaseCode = error.code;
  const mapping = FIREBASE_ERROR_MAP[firebaseCode];

  if (mapping) {
    return createAuthError(
      AUTH_ERROR_CODES[mapping.code],
      mapping.message
    );
  }

  // Erreur par défaut si le code n'est pas mappé
  logger.log(LogLevel.WARN, 'Code d\'erreur Firebase non mappé:', { code: firebaseCode });
  return createAuthError(
    AUTH_ERROR_CODES.FIREBASE_ERROR,
    'Une erreur inattendue est survenue.'
  );
};

export const isFirebaseError = (error: unknown): error is FirebaseAuthError => {
  return error instanceof Error && 'code' in error;
};

export const handleFirebaseError = (error: unknown) => {
  if (isFirebaseError(error)) {
    return mapFirebaseError(error);
  }
  
  return createAuthError(
    AUTH_ERROR_CODES.UNKNOWN_ERROR,
    'Une erreur inconnue est survenue.'
  );
};
