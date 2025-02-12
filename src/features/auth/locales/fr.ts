import { AuthErrorCode } from '../errors/AuthError';

export const authMessages = {
  errors: {
    [AuthErrorCode.WALLET_NOT_FOUND]: 'Wallet non détecté. Veuillez installer MetaMask.',
    [AuthErrorCode.NETWORK_MISMATCH]: 'Réseau incorrect. Veuillez changer de réseau.',
    [AuthErrorCode.INVALID_SIGNATURE]: 'Signature invalide. Veuillez réessayer.',
    [AuthErrorCode.SESSION_EXPIRED]: 'Session expirée. Veuillez vous reconnecter.',
    [AuthErrorCode.FIREBASE_ERROR]: 'Erreur d\'authentification. Veuillez réessayer.',
    [AuthErrorCode.WALLET_DISCONNECTED]: 'Wallet déconnecté. Veuillez vous reconnecter.',
    [AuthErrorCode.PROVIDER_ERROR]: 'Erreur du provider. Veuillez réessayer.',
    [AuthErrorCode.INVALID_EMAIL]: 'Adresse email invalide.',
    [AuthErrorCode.USER_DISABLED]: 'Ce compte a été désactivé.',
    [AuthErrorCode.USER_NOT_FOUND]: 'Aucun utilisateur trouvé avec ces identifiants.',
    [AuthErrorCode.WRONG_PASSWORD]: 'Mot de passe incorrect.',
    [AuthErrorCode.EMAIL_ALREADY_IN_USE]: 'Cette adresse email est déjà utilisée.',
    [AuthErrorCode.OPERATION_NOT_ALLOWED]: 'Opération non autorisée.',
    [AuthErrorCode.TOO_MANY_REQUESTS]: 'Trop de tentatives. Veuillez réessayer plus tard.',
    [AuthErrorCode.INVALID_OPERATION]: 'Opération invalide.',
    [AuthErrorCode.SIGN_IN_ERROR]: 'Erreur lors de la connexion.',
    [AuthErrorCode.GOOGLE_SIGN_IN_ERROR]: 'Erreur lors de la connexion avec Google.',
    [AuthErrorCode.CREATE_USER_ERROR]: 'Erreur lors de la création du compte.',
    [AuthErrorCode.RESET_PASSWORD_ERROR]: 'Erreur lors de la réinitialisation du mot de passe.',
    [AuthErrorCode.UPDATE_PROFILE_ERROR]: 'Erreur lors de la mise à jour du profil.',
    [AuthErrorCode.SIGN_OUT_ERROR]: 'Erreur lors de la déconnexion.',
    [AuthErrorCode.SESSION_CHECK_ERROR]: 'Erreur lors de la vérification de la session.',
    [AuthErrorCode.SESSION_REFRESH_ERROR]: 'Erreur lors du rafraîchissement de la session.',
    [AuthErrorCode.INTERNAL_ERROR]: 'Erreur interne du serveur.',
    [AuthErrorCode.PERSISTENCE_ERROR]: 'Erreur lors de la sauvegarde des données.',
    [AuthErrorCode.STORAGE_ERROR]: 'Erreur de stockage. Veuillez réessayer.',
    'unknown-error': 'Une erreur inattendue s\'est produite.'
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
