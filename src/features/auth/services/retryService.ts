import { createAuthError, AuthError } from '../errors/AuthError';
import { logService } from './logService';

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  onError?: (error: Error) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000,    // 10 seconds
  backoffFactor: 2
};

const LOG_CATEGORY = 'RetryService';

export class RetryService {
  private static instance: RetryService | null = null;

  private constructor() {}

  static getInstance(): RetryService {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService();
    }
    return RetryService.instance;
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    retryableErrors: string[] = []
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    let lastError: Error | null = null;
    let delay = finalConfig.initialDelay;

    logService.debug(LOG_CATEGORY, 'Starting retry operation', {
      maxAttempts: finalConfig.maxAttempts,
      initialDelay: finalConfig.initialDelay,
      retryableErrors
    });

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        logService.debug(LOG_CATEGORY, `Attempt ${attempt}/${finalConfig.maxAttempts}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Vérifier si l'erreur est retryable
        if (error instanceof AuthError) {
          if (!retryableErrors.includes(error.code)) {
            logService.info(LOG_CATEGORY, 'Non-retryable error encountered', {
              errorCode: error.code,
              attempt
            });
            throw error;
          }
        }

        // Si c'est la dernière tentative, on lance l'erreur
        if (attempt === finalConfig.maxAttempts) {
          const finalError = createAuthError(
            AuthError.CODES.PROVIDER_ERROR,
            `Operation failed after ${attempt} attempts`,
            { originalError: lastError }
          );
          logService.error(LOG_CATEGORY, 'All retry attempts failed', finalError);
          throw finalError;
        }

        // Attendre avant la prochaine tentative
        logService.debug(LOG_CATEGORY, `Waiting ${delay}ms before next attempt`, {
          attempt,
          nextDelay: delay
        });
        await this.delay(delay);
        
        // Calculer le prochain délai avec backoff exponentiel
        delay = Math.min(
          delay * finalConfig.backoffFactor,
          finalConfig.maxDelay
        );
      }
    }

    // Ne devrait jamais arriver à cause du throw dans la boucle
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operationName: string
  ): Promise<T> {
    logService.debug(LOG_CATEGORY, `Starting operation with timeout`, {
      operationName,
      timeoutMs
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const error = createAuthError(
          AuthError.CODES.PROVIDER_ERROR,
          `Operation ${operationName} timed out after ${timeoutMs}ms`
        );
        logService.error(LOG_CATEGORY, 'Operation timed out', error);
        reject(error);
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}

export const retryService = RetryService.getInstance();

// Liste des erreurs retryables par défaut
export const DEFAULT_RETRYABLE_ERRORS = [
  AuthError.CODES.NETWORK_MISMATCH,
  AuthError.CODES.PROVIDER_ERROR
];
