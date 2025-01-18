import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TokenForgeError, TokenForgeErrorCode, withRetry } from '../../utils/errors';
import { isNullOrUndefined } from '../../utils/typeGuards';

interface ErrorState {
  message: string;
  code?: TokenForgeErrorCode;
  isVisible: boolean;
  timestamp?: number;
}

const DEFAULT_TIMEOUT = 5000;
const MAX_ERROR_HISTORY = 10;

export const useErrorHandler = (timeout: number = DEFAULT_TIMEOUT) => {
  const [error, setError] = useState<ErrorState>({ 
    message: '', 
    isVisible: false 
  });
  
  // Garde un historique des erreurs pour l'analyse
  const errorHistory = useRef<ErrorState[]>([]);
  
  // Timer pour masquer l'erreur
  const timerRef = useRef<NodeJS.Timeout>();

  // Mémorise la fonction de traitement d'erreur
  const handleError = useCallback((error: unknown) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    let message: string;
    let code: TokenForgeErrorCode | undefined;
    
    if (isNullOrUndefined(error)) {
      message = 'Une erreur inconnue est survenue';
      code = TokenForgeErrorCode.UNKNOWN_ERROR;
    } else if (error instanceof TokenForgeError) {
      message = error.message;
      code = error.code;
    } else if (error instanceof Error) {
      message = error.message;
      code = TokenForgeErrorCode.INTERNAL_ERROR;
    } else if (typeof error === 'string') {
      message = error;
      code = TokenForgeErrorCode.INTERNAL_ERROR;
    } else {
      message = 'Une erreur inattendue est survenue';
      code = TokenForgeErrorCode.UNKNOWN_ERROR;
    }

    const newError = { 
      message, 
      code, 
      isVisible: true,
      timestamp: Date.now()
    };

    // Met à jour l'historique des erreurs
    errorHistory.current = [
      newError,
      ...errorHistory.current.slice(0, MAX_ERROR_HISTORY - 1)
    ];

    setError(newError);
    
    // Configure le timer pour masquer l'erreur
    timerRef.current = setTimeout(() => {
      setError(prev => ({ ...prev, isVisible: false }));
    }, timeout);
  }, [timeout]);

  const clearError = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setError({ message: '', isVisible: false });
  }, []);

  // Mémorise les statistiques d'erreur
  const errorStats = useMemo(() => {
    const history = errorHistory.current;
    return {
      totalErrors: history.length,
      mostCommonError: history
        .reduce((acc, curr) => {
          const key = curr.code || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      lastErrorTime: history[0]?.timestamp
    };
  }, [error]); // Recalcule uniquement quand une nouvelle erreur arrive

  // Nettoie le timer lors du démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { 
    error, 
    handleError,
    clearError,
    isError: error.isVisible,
    errorStats,
    // Fonction utilitaire pour réessayer une opération qui a échoué
    retryOperation: useCallback(<T>(
      operation: () => Promise<T>,
      maxRetries?: number,
      baseDelay?: number
    ) => withRetry(operation, maxRetries, baseDelay), [])
  };
};