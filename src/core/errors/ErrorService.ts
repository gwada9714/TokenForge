import { logger } from '../logger';
import * as Sentry from '@sentry/react';

/**
 * Codes d'erreur standardisés pour l'application
 */
export enum ErrorCode {
  // Erreurs d'authentification
  AUTH_EMAIL_NOT_VERIFIED = 'auth/email-not-verified',
  AUTH_INVALID_CREDENTIALS = 'auth/invalid-credentials',
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_WRONG_PASSWORD = 'auth/wrong-password',
  AUTH_TOO_MANY_REQUESTS = 'auth/too-many-requests',
  AUTH_WEAK_PASSWORD = 'auth/weak-password',
  AUTH_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  AUTH_INVALID_EMAIL = 'auth/invalid-email',
  AUTH_OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
  AUTH_POPUP_CLOSED = 'auth/popup-closed-by-user',
  AUTH_PROVIDER_ERROR = 'auth/provider-error',
  AUTH_ACCOUNT_EXISTS = 'auth/account-exists-with-different-credential',
  AUTH_SESSION_EXPIRED = 'auth/session-expired',
  AUTH_NETWORK_ERROR = 'auth/network-error',
  
  // Erreurs de blockchain
  BLOCKCHAIN_WRONG_NETWORK = 'blockchain/wrong-network',
  BLOCKCHAIN_NOT_CONNECTED = 'blockchain/not-connected',
  BLOCKCHAIN_TRANSACTION_FAILED = 'blockchain/transaction-failed',
  BLOCKCHAIN_USER_REJECTED = 'blockchain/user-rejected',
  BLOCKCHAIN_INSUFFICIENT_FUNDS = 'blockchain/insufficient-funds',
  BLOCKCHAIN_CONTRACT_ERROR = 'blockchain/contract-error',
  BLOCKCHAIN_GAS_ESTIMATION_FAILED = 'blockchain/gas-estimation-failed',
  BLOCKCHAIN_TIMEOUT = 'blockchain/timeout',
  
  // Erreurs de validation
  VALIDATION_REQUIRED = 'validation/required-field',
  VALIDATION_INVALID_FORMAT = 'validation/invalid-format',
  VALIDATION_TOO_SHORT = 'validation/too-short',
  VALIDATION_TOO_LONG = 'validation/too-long',
  VALIDATION_INVALID_AMOUNT = 'validation/invalid-amount',
  VALIDATION_INVALID_ADDRESS = 'validation/invalid-address',
  
  // Erreurs API
  API_NETWORK_ERROR = 'api/network-error',
  API_TIMEOUT = 'api/timeout',
  API_SERVER_ERROR = 'api/server-error',
  API_NOT_FOUND = 'api/not-found',
  API_UNAUTHORIZED = 'api/unauthorized',
  API_FORBIDDEN = 'api/forbidden',
  API_RATE_LIMIT = 'api/rate-limit',
  
  // Erreurs générales
  UNKNOWN_ERROR = 'unknown/error',
  INTERNAL_ERROR = 'internal/error',
  NOT_IMPLEMENTED = 'not-implemented',
  FEATURE_DISABLED = 'feature/disabled'
}

/**
 * Niveaux de sévérité des erreurs
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Interface pour les détails d'erreur
 */
export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  originalError?: unknown;
  context?: Record<string, unknown>;
  timestamp: number;
  handled: boolean;
}

/**
 * Type pour les écouteurs d'erreurs
 */
export type ErrorListener = (error: ErrorDetails) => void;

/**
 * Service centralisé de gestion des erreurs
 */
class ErrorService {
  private static instance: ErrorService;
  private errorListeners: ErrorListener[] = [];
  
  private constructor() {}
  
  /**
   * Obtient l'instance singleton du service d'erreur
   */
  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }
  
  /**
   * Ajoute un écouteur d'erreurs
   */
  public addErrorListener(listener: ErrorListener): void {
    this.errorListeners.push(listener);
  }
  
  /**
   * Supprime un écouteur d'erreurs
   */
  public removeErrorListener(listener: ErrorListener): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }
  
  /**
   * Crée une erreur standardisée
   */
  public createError(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    originalError?: unknown,
    context?: Record<string, unknown>
  ): ErrorDetails {
    return {
      code,
      message,
      severity,
      originalError,
      context,
      timestamp: Date.now(),
      handled: false
    };
  }
  
  /**
   * Gère une erreur
   */
  public handleError(
    errorOrCode: unknown | ErrorCode,
    message?: string,
    severity?: ErrorSeverity,
    context?: Record<string, unknown>
  ): ErrorDetails {
    // Si c'est déjà un ErrorDetails, marquer comme géré et retourner
    if (this.isErrorDetails(errorOrCode)) {
      errorOrCode.handled = true;
      this.notifyListeners(errorOrCode);
      this.logError(errorOrCode);
      return errorOrCode;
    }
    
    // Si c'est un code d'erreur, créer un ErrorDetails
    if (typeof errorOrCode === 'string' && Object.values(ErrorCode).includes(errorOrCode as ErrorCode)) {
      const errorDetails = this.createError(
        errorOrCode as ErrorCode,
        message || 'Une erreur est survenue',
        severity || ErrorSeverity.ERROR,
        undefined,
        context
      );
      errorDetails.handled = true;
      this.notifyListeners(errorDetails);
      this.logError(errorDetails);
      return errorDetails;
    }
    
    // Sinon, normaliser l'erreur
    const normalizedError = this.normalizeError(errorOrCode, message, severity, context);
    normalizedError.handled = true;
    this.notifyListeners(normalizedError);
    this.logError(normalizedError);
    return normalizedError;
  }
  
  /**
   * Normalise une erreur en ErrorDetails
   */
  private normalizeError(
    error: unknown,
    message?: string,
    severity?: ErrorSeverity,
    context?: Record<string, unknown>
  ): ErrorDetails {
    // Erreur Firebase
    if (this.isFirebaseError(error)) {
      return this.createError(
        this.mapFirebaseErrorCode(error.code),
        message || error.message,
        severity || ErrorSeverity.ERROR,
        error,
        context
      );
    }
    
    // Erreur standard
    if (error instanceof Error) {
      return this.createError(
        ErrorCode.UNKNOWN_ERROR,
        message || error.message,
        severity || ErrorSeverity.ERROR,
        error,
        context
      );
    }
    
    // Erreur sous forme de chaîne
    if (typeof error === 'string') {
      return this.createError(
        ErrorCode.UNKNOWN_ERROR,
        message || error,
        severity || ErrorSeverity.ERROR,
        error,
        context
      );
    }
    
    // Erreur inconnue
    return this.createError(
      ErrorCode.UNKNOWN_ERROR,
      message || 'Une erreur inconnue est survenue',
      severity || ErrorSeverity.ERROR,
      error,
      context
    );
  }
  
  /**
   * Vérifie si un objet est un ErrorDetails
   */
  private isErrorDetails(obj: unknown): obj is ErrorDetails {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'code' in obj &&
      'message' in obj &&
      'severity' in obj &&
      'timestamp' in obj
    );
  }
  
  /**
   * Vérifie si une erreur est une erreur Firebase
   */
  private isFirebaseError(error: unknown): error is { code: string; message: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      typeof (error as any).code === 'string' &&
      typeof (error as any).message === 'string'
    );
  }
  
  /**
   * Mappe un code d'erreur Firebase à un code d'erreur standardisé
   */
  private mapFirebaseErrorCode(firebaseCode: string): ErrorCode {
    switch (firebaseCode) {
      case 'auth/email-already-in-use':
        return ErrorCode.AUTH_EMAIL_ALREADY_IN_USE;
      case 'auth/invalid-email':
        return ErrorCode.AUTH_INVALID_EMAIL;
      case 'auth/user-disabled':
      case 'auth/user-not-found':
        return ErrorCode.AUTH_USER_NOT_FOUND;
      case 'auth/wrong-password':
        return ErrorCode.AUTH_WRONG_PASSWORD;
      case 'auth/too-many-requests':
        return ErrorCode.AUTH_TOO_MANY_REQUESTS;
      case 'auth/weak-password':
        return ErrorCode.AUTH_WEAK_PASSWORD;
      case 'auth/operation-not-allowed':
        return ErrorCode.AUTH_OPERATION_NOT_ALLOWED;
      case 'auth/popup-closed-by-user':
        return ErrorCode.AUTH_POPUP_CLOSED;
      case 'auth/account-exists-with-different-credential':
        return ErrorCode.AUTH_ACCOUNT_EXISTS;
      default:
        return ErrorCode.UNKNOWN_ERROR;
    }
  }
  
  /**
   * Notifie tous les écouteurs d'erreurs
   */
  private notifyListeners(error: ErrorDetails): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Erreur dans un écouteur d\'erreurs:', listenerError);
      }
    });
  }
  
  /**
   * Journalise une erreur
   */
  private logError(error: ErrorDetails): void {
    const logData = {
      code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context,
      timestamp: new Date(error.timestamp).toISOString()
    };
    
    switch (error.severity) {
      case ErrorSeverity.INFO:
        logger.info({
          category: 'ErrorService',
          message: error.message,
          data: logData
        });
        break;
      case ErrorSeverity.WARNING:
        logger.warn({
          category: 'ErrorService',
          message: error.message,
          data: logData
        });
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        logger.error({
          category: 'ErrorService',
          message: error.message,
          data: logData,
          error: error.originalError instanceof Error ? error.originalError : undefined
        });
        
        // Envoyer à Sentry si c'est une erreur critique
        if (error.severity === ErrorSeverity.CRITICAL && import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true') {
          Sentry.captureException(error.originalError || error.message, {
            tags: {
              code: error.code,
              severity: error.severity
            },
            extra: {
              ...error.context,
              timestamp: error.timestamp
            }
          });
        }
        break;
    }
  }
}

// Exporter l'instance singleton
export const errorService = ErrorService.getInstance();

// Exporter une classe d'erreur personnalisée
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: number;
  
  constructor(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = Date.now();
  }
  
  /**
   * Convertit l'erreur en ErrorDetails
   */
  public toErrorDetails(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      originalError: this,
      context: this.context,
      timestamp: this.timestamp,
      handled: false
    };
  }
}
