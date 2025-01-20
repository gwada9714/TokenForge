import { AuthError, AUTH_ERROR_CODES, ErrorCode } from '../types';

// Type pour les erreurs Firebase
interface FirebaseError extends Error {
  code: string;
  customData?: Record<string, unknown>;
}

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
  private readonly ERROR_MESSAGES = {
    fr: {
      [AUTH_ERROR_CODES.WALLET_NOT_FOUND]: 'Portefeuille non trouvé. Veuillez vous assurer que MetaMask est installé.',
      [AUTH_ERROR_CODES.NETWORK_MISMATCH]: 'Réseau incorrect. Veuillez vous connecter au réseau Ethereum principal ou Sepolia.',
      [AUTH_ERROR_CODES.INVALID_SIGNATURE]: 'Signature invalide. Veuillez réessayer.',
      [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'Session expirée. Veuillez vous reconnecter.',
      [AUTH_ERROR_CODES.FIREBASE_ERROR]: 'Erreur d\'authentification Firebase.',
      [AUTH_ERROR_CODES.WALLET_DISCONNECTED]: 'Portefeuille déconnecté.',
      [AUTH_ERROR_CODES.PROVIDER_ERROR]: 'Erreur du fournisseur Web3.',
      // Messages Firebase
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
      'auth/invalid-email': 'Adresse email invalide.',
      'auth/operation-not-allowed': 'Opération non autorisée.',
      'auth/weak-password': 'Le mot de passe est trop faible.',
      'auth/user-disabled': 'Ce compte a été désactivé.',
      'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/invalid-verification-code': 'Code de vérification invalide.',
      'auth/invalid-verification-id': 'ID de vérification invalide.',
      'email-not-verified': 'Veuillez vérifier votre adresse email avant de continuer.',
      'verification-timeout': 'Le délai de vérification de l\'email a expiré.',
      'unknown-error': 'Une erreur inattendue s\'est produite.',
    },
    en: {
      [AUTH_ERROR_CODES.WALLET_NOT_FOUND]: 'Wallet not found. Please make sure MetaMask is installed.',
      [AUTH_ERROR_CODES.NETWORK_MISMATCH]: 'Incorrect network. Please connect to Ethereum Mainnet or Sepolia.',
      [AUTH_ERROR_CODES.INVALID_SIGNATURE]: 'Invalid signature. Please try again.',
      [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'Session expired. Please log in again.',
      [AUTH_ERROR_CODES.FIREBASE_ERROR]: 'Firebase authentication error.',
      [AUTH_ERROR_CODES.WALLET_DISCONNECTED]: 'Wallet disconnected.',
      [AUTH_ERROR_CODES.PROVIDER_ERROR]: 'Web3 provider error.',
      // Firebase messages
      'auth/email-already-in-use': 'This email is already in use.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Operation not allowed.',
      'auth/weak-password': 'Password is too weak.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-verification-code': 'Invalid verification code.',
      'auth/invalid-verification-id': 'Invalid verification ID.',
      'email-not-verified': 'Please verify your email address before continuing.',
      'verification-timeout': 'Email verification timeout expired.',
      'unknown-error': 'An unexpected error occurred.',
    },
  };

  setLocale(locale: 'fr' | 'en'): void {
    this.currentLocale = locale;
  }

  private getLocalizedMessage(code: string): string {
    return this.ERROR_MESSAGES[this.currentLocale][code] || this.ERROR_MESSAGES[this.currentLocale]['unknown-error'];
  }

  private createAuthError(code: ErrorCode, message: string, details?: Record<string, unknown>): AuthError {
    const error = new Error(message) as AuthError;
    error.code = code;
    error.details = details;
    error.name = 'AuthError';
    error.toJSON = function() {
      return {
        name: this.name,
        message: this.message,
        code: this.code,
        details: this.details,
      };
    };
    return error;
  }

  private isFirebaseError(error: unknown): error is FirebaseError {
    return error instanceof Error && 'code' in error;
  }

  private handleFirebaseError(error: FirebaseError): AuthError {
    const message = this.getLocalizedMessage(error.code);
    return this.createAuthError(AUTH_ERROR_CODES.FIREBASE_ERROR, message, {
      originalError: error.code,
      customData: error.customData,
    });
  }

  private handleWalletError(error: Error): AuthError {
    let code: ErrorCode = AUTH_ERROR_CODES.PROVIDER_ERROR;
    
    if (error.message.includes('wallet') || error.message.includes('metamask')) {
      code = AUTH_ERROR_CODES.WALLET_NOT_FOUND;
    } else if (error.message.includes('network') || error.message.includes('chain')) {
      code = AUTH_ERROR_CODES.NETWORK_MISMATCH;
    } else if (error.message.includes('signature')) {
      code = AUTH_ERROR_CODES.INVALID_SIGNATURE;
    }

    return this.createAuthError(code, this.getLocalizedMessage(code), {
      originalError: error.message,
    });
  }

  handleError(error: unknown): AuthError {
    if (this.isFirebaseError(error)) {
      return this.handleFirebaseError(error);
    }

    if (error instanceof Error) {
      return this.handleWalletError(error);
    }

    // Fallback pour les erreurs inconnues
    return this.createAuthError(
      AUTH_ERROR_CODES.PROVIDER_ERROR,
      this.getLocalizedMessage('unknown-error'),
      { originalError: String(error) }
    );
  }
}

export const errorService = ErrorService.getInstance();
