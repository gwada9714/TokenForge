import { AuthError } from '../errors/AuthError';
import { ErrorCode } from '../types';

// Type pour les erreurs Firebase
interface FirebaseError extends Error {
  code: string;
  customData?: Record<string, unknown>;
}

// Messages d'erreur localisés
const ERROR_MESSAGES = {
  fr: {
    [AuthError.CODES.WALLET_NOT_FOUND]: 'Portefeuille non trouvé. Veuillez vous assurer que MetaMask est installé.',
    [AuthError.CODES.NETWORK_MISMATCH]: 'Réseau incorrect. Veuillez vous connecter au réseau Ethereum principal ou Sepolia.',
    [AuthError.CODES.INVALID_SIGNATURE]: 'Signature invalide. Veuillez réessayer.',
    [AuthError.CODES.SESSION_EXPIRED]: 'Session expirée. Veuillez vous reconnecter.',
    [AuthError.CODES.FIREBASE_ERROR]: 'Erreur d\'authentification Firebase.',
    [AuthError.CODES.WALLET_DISCONNECTED]: 'Portefeuille déconnecté.',
    [AuthError.CODES.PROVIDER_ERROR]: 'Erreur du fournisseur Web3.',
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
  },
  en: {
    [AuthError.CODES.WALLET_NOT_FOUND]: 'Wallet not found. Please make sure MetaMask is installed.',
    [AuthError.CODES.NETWORK_MISMATCH]: 'Incorrect network. Please connect to Ethereum Mainnet or Sepolia.',
    [AuthError.CODES.INVALID_SIGNATURE]: 'Invalid signature. Please try again.',
    [AuthError.CODES.SESSION_EXPIRED]: 'Session expired. Please sign in again.',
    [AuthError.CODES.FIREBASE_ERROR]: 'Firebase authentication error.',
    [AuthError.CODES.WALLET_DISCONNECTED]: 'Wallet disconnected.',
    [AuthError.CODES.PROVIDER_ERROR]: 'Web3 provider error.',
    // Firebase messages
    'auth/email-already-in-use': 'This email address is already in use.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'Operation not allowed.',
    'auth/weak-password': 'The password is too weak.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-verification-code': 'Invalid verification code.',
    'auth/invalid-verification-id': 'Invalid verification ID.',
    'email-not-verified': 'Please verify your email address before continuing.',
    'verification-timeout': 'Email verification timeout expired.',
  },
};

export class ErrorService {
  private static instance: ErrorService;
  private currentLocale: 'fr' | 'en' = 'fr';

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  setLocale(locale: 'fr' | 'en') {
    this.currentLocale = locale;
  }

  private getLocalizedMessage(code: string): string {
    const messages = ERROR_MESSAGES[this.currentLocale];
    return messages[code] || messages[AuthError.CODES.FIREBASE_ERROR];
  }

  handleFirebaseError(error: FirebaseError): AuthError {
    console.error('Firebase Error:', error);
    
    const message = this.getLocalizedMessage(error.code);
    return new AuthError(
      'AUTH_005' as ErrorCode,
      message,
      {
        originalError: error.message,
        code: error.code,
      }
    );
  }

  handleWalletError(error: Error): AuthError {
    console.error('Wallet Error:', error);
    
    // Déterminer le type d'erreur wallet
    let code: ErrorCode = 'AUTH_009'; // PROVIDER_ERROR
    if (error.message.includes('wallet_not_found')) {
      code = 'AUTH_001'; // WALLET_NOT_FOUND
    } else if (error.message.includes('network')) {
      code = 'AUTH_002'; // NETWORK_MISMATCH
    }

    const message = this.getLocalizedMessage(code);
    return new AuthError(
      code,
      message,
      {
        originalError: error.message,
      }
    );
  }

  handleAuthError(error: AuthError): AuthError {
    console.error('Auth Error:', error);
    
    const message = this.getLocalizedMessage(error.code);
    return new AuthError(
      error.code,
      message,
      error.details
    );
  }

  // Méthode générique pour gérer n'importe quel type d'erreur
  handleError(error: unknown): AuthError {
    if (this.isFirebaseError(error)) {
      return this.handleFirebaseError(error);
    }
    if (error instanceof AuthError) {
      return this.handleAuthError(error);
    }
    if (error instanceof Error) {
      return this.handleWalletError(error);
    }

    // Erreur inconnue
    console.error('Unknown Error:', error);
    return new AuthError(
      'AUTH_009' as ErrorCode,
      this.getLocalizedMessage('AUTH_009'),
      { originalError: error }
    );
  }

  private isFirebaseError(error: unknown): error is FirebaseError {
    return error instanceof Error && 'code' in error;
  }
}

export const errorService = ErrorService.getInstance();
