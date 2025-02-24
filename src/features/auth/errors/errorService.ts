import { AuthError, AUTH_ERROR_CODES, ErrorCode } from './AuthError';
import { logService } from '../services/logService';

const LOG_CATEGORY = 'ErrorService';

class ErrorService {
  private static instance: ErrorService;
  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  createAuthError(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ): AuthError {
    const error = AuthError.create(code, message, details);
    this.logError(error);
    return error;
  }

  private logError(error: AuthError): void {
    logService.error(LOG_CATEGORY, error.message, error, {
      code: error.code,
      details: error.details
    });
  }

  handleAuthError(error: unknown): AuthError {
    if (error instanceof AuthError) {
      this.logError(error);
      return error;
    }

    // Convertir les erreurs inconnues en AuthError
    const genericError = this.createAuthError(
      AUTH_ERROR_CODES.UNKNOWN_ERROR,
      error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      { originalError: error }
    );

    this.logError(genericError);
    return genericError;
  }

  isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }
}

export const errorService = ErrorService.getInstance();
