import type { AuthError } from '../types';
import { AuthErrorCode } from '../errors/AuthError';

// Type pour les erreurs Firebase
interface FirebaseError extends Error {
  code: string;
  customData?: Record<string, unknown>;
}

// Type pour les messages d'erreur
type ErrorMessages = {
  [key in AuthErrorCode | 'auth/email-already-in-use' | 'auth/invalid-email' | 
    'auth/operation-not-allowed' | 'auth/weak-password' | 'auth/user-disabled' |
    'auth/user-not-found' | 'auth/wrong-password' | 'auth/too-many-requests' |
    'unknown-error']: string;
};

type LocalizedMessages = {
  fr: ErrorMessages;
  en: ErrorMessages;
};

class ErrorService {
  private static instance: ErrorService;
  private currentLocale: 'fr' | 'en' = 'fr';

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  // Messages d'erreur localisés
  private readonly ERROR_MESSAGES: LocalizedMessages = {
    fr: {
      [AuthErrorCode.WALLET_NOT_FOUND]: 'Portefeuille non trouvé. Veuillez vous assurer que MetaMask est installé.',
      [AuthErrorCode.NETWORK_MISMATCH]: 'Réseau incorrect. Veuillez vous connecter au réseau Ethereum principal ou Sepolia.',
      [AuthErrorCode.INVALID_SIGNATURE]: 'Signature invalide. Veuillez réessayer.',
      [AuthErrorCode.SESSION_EXPIRED]: 'Session expirée. Veuillez vous reconnecter.',
      [AuthErrorCode.FIREBASE_ERROR]: 'Erreur d\'authentification Firebase.',
      [AuthErrorCode.WALLET_DISCONNECTED]: 'Portefeuille déconnecté.',
      [AuthErrorCode.PROVIDER_ERROR]: 'Erreur du fournisseur Web3.',
      // Messages Firebase
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
      'auth/invalid-email': 'Adresse email invalide.',
      'auth/operation-not-allowed': 'Opération non autorisée.',
      'auth/weak-password': 'Le mot de passe est trop faible.',
      'auth/user-disabled': 'Ce compte a été désactivé.',
      'auth/user-not-found': 'Aucun utilisateur trouvé avec ces identifiants.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
      'unknown-error': 'Une erreur inattendue s\'est produite.',
      // Autres codes d'erreur de l'enum
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
      [AuthErrorCode.INTERNAL_ERROR]: 'Erreur interne du serveur.'
    },
    en: {
      [AuthErrorCode.WALLET_NOT_FOUND]: 'Wallet not found. Please make sure MetaMask is installed.',
      [AuthErrorCode.NETWORK_MISMATCH]: 'Incorrect network. Please connect to Ethereum Mainnet or Sepolia.',
      [AuthErrorCode.INVALID_SIGNATURE]: 'Invalid signature. Please try again.',
      [AuthErrorCode.SESSION_EXPIRED]: 'Session expired. Please log in again.',
      [AuthErrorCode.FIREBASE_ERROR]: 'Firebase authentication error.',
      [AuthErrorCode.WALLET_DISCONNECTED]: 'Wallet disconnected.',
      [AuthErrorCode.PROVIDER_ERROR]: 'Web3 provider error.',
      // Firebase messages
      'auth/email-already-in-use': 'This email is already in use.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Operation not allowed.',
      'auth/weak-password': 'The password is too weak.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No user found with these credentials.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'unknown-error': 'An unexpected error occurred.',
      // Autres codes d'erreur de l'enum
      [AuthErrorCode.INVALID_EMAIL]: 'Invalid email address.',
      [AuthErrorCode.USER_DISABLED]: 'This account has been disabled.',
      [AuthErrorCode.USER_NOT_FOUND]: 'No user found with these credentials.',
      [AuthErrorCode.WRONG_PASSWORD]: 'Incorrect password.',
      [AuthErrorCode.EMAIL_ALREADY_IN_USE]: 'This email is already in use.',
      [AuthErrorCode.OPERATION_NOT_ALLOWED]: 'Operation not allowed.',
      [AuthErrorCode.TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',
      [AuthErrorCode.INVALID_OPERATION]: 'Invalid operation.',
      [AuthErrorCode.SIGN_IN_ERROR]: 'Error during sign in.',
      [AuthErrorCode.GOOGLE_SIGN_IN_ERROR]: 'Error during Google sign in.',
      [AuthErrorCode.CREATE_USER_ERROR]: 'Error during account creation.',
      [AuthErrorCode.RESET_PASSWORD_ERROR]: 'Error during password reset.',
      [AuthErrorCode.UPDATE_PROFILE_ERROR]: 'Error during profile update.',
      [AuthErrorCode.SIGN_OUT_ERROR]: 'Error during sign out.',
      [AuthErrorCode.SESSION_CHECK_ERROR]: 'Error during session check.',
      [AuthErrorCode.SESSION_REFRESH_ERROR]: 'Error during session refresh.',
      [AuthErrorCode.INTERNAL_ERROR]: 'Internal server error.'
    }
  };

  public setLocale(locale: 'fr' | 'en'): void {
    this.currentLocale = locale;
  }

  public getLocalizedMessage(code: keyof ErrorMessages): string {
    return this.ERROR_MESSAGES[this.currentLocale][code] || this.ERROR_MESSAGES[this.currentLocale]['unknown-error'];
  }

  public createAuthError(code: typeof AuthErrorCode[keyof typeof AuthErrorCode], message: string, details?: Record<string, unknown>): AuthError {
    const error = new Error(message) as AuthError;
    error.code = code;
    error.details = details;
    return error;
  }

  public handleError(error: unknown): AuthError {
    if (error instanceof Error) {
      if ('code' in error && typeof (error as any).code === 'string') {
        return this.handleFirebaseError(error as FirebaseError);
      }
      return this.handleWalletError(error);
    }

    // Fallback pour les erreurs inconnues
    return this.createAuthError(
      AuthErrorCode.PROVIDER_ERROR,
      this.getLocalizedMessage('unknown-error'),
      { originalError: String(error) }
    );
  }

  public handleAuthError(error: unknown): AuthError {
    const authError = this.handleError(error);
    if (!authError.code.startsWith('AUTH_')) {
      authError.code = AuthErrorCode.FIREBASE_ERROR;
    }
    return authError;
  }

  private handleFirebaseError(error: FirebaseError): AuthError {
    const message = this.getLocalizedMessage(error.code as keyof ErrorMessages);
    return this.createAuthError(AuthErrorCode.FIREBASE_ERROR, message, {
      originalError: error.code,
      customData: error.customData,
    });
  }

  private handleWalletError(error: Error): AuthError {
    let code: typeof AuthErrorCode[keyof typeof AuthErrorCode] = AuthErrorCode.PROVIDER_ERROR;
    
    if (error.message.includes('wallet') || error.message.includes('metamask')) {
      code = AuthErrorCode.WALLET_NOT_FOUND;
    } else if (error.message.includes('network') || error.message.includes('chain')) {
      code = AuthErrorCode.NETWORK_MISMATCH;
    } else if (error.message.includes('signature')) {
      code = AuthErrorCode.INVALID_SIGNATURE;
    }

    return this.createAuthError(code, this.getLocalizedMessage(code), {
      originalError: error.message
    });
  }
}

export const errorService = ErrorService.getInstance();
