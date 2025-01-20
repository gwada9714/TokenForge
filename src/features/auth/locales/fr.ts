import { AUTH_ERROR_CODES } from '../constants/error-codes';

export const authMessages = {
  errors: {
    [AUTH_ERROR_CODES.WALLET_NOT_FOUND]: 'Wallet non détecté. Veuillez installer MetaMask.',
    [AUTH_ERROR_CODES.NETWORK_MISMATCH]: 'Réseau incorrect. Veuillez changer de réseau.',
    [AUTH_ERROR_CODES.INVALID_SIGNATURE]: 'Signature invalide. Veuillez réessayer.',
    [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'Session expirée. Veuillez vous reconnecter.',
    [AUTH_ERROR_CODES.FIREBASE_ERROR]: 'Erreur d\'authentification. Veuillez réessayer.',
    [AUTH_ERROR_CODES.TWO_FACTOR_REQUIRED]: 'Authentification à deux facteurs requise.',
    [AUTH_ERROR_CODES.TWO_FACTOR_INVALID]: 'Code 2FA invalide. Veuillez réessayer.',
    [AUTH_ERROR_CODES.WALLET_DISCONNECTED]: 'Wallet déconnecté. Veuillez vous reconnecter.',
    [AUTH_ERROR_CODES.PROVIDER_ERROR]: 'Erreur du provider. Veuillez réessayer.',
    [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]: 'Email non vérifié. Veuillez vérifier votre email.',
    [AUTH_ERROR_CODES.EMAIL_VERIFICATION_TIMEOUT]: 'Délai de vérification de l\'email dépassé. Veuillez réessayer.',
    [AUTH_ERROR_CODES.NO_USER]: 'Utilisateur non trouvé.',
    [AUTH_ERROR_CODES.STORAGE_ERROR]: 'Erreur de stockage. Veuillez réessayer.'
  },
  status: {
    idle: 'Prêt',
    loading: 'Chargement...',
    authenticated: 'Connecté',
    unauthenticated: 'Non connecté',
    verifying: 'Vérification...',
    error: 'Erreur'
  }
} as const;
