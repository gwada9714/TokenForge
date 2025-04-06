import { useState, useCallback, useEffect } from "react";
import {
  errorService,
  ErrorCode,
  ErrorSeverity,
  ErrorDetails,
  ErrorListener,
} from "../core/errors/ErrorService";

/**
 * Interface pour le retour du hook useError
 */
export interface UseErrorReturn {
  error: ErrorDetails | null;
  hasError: boolean;
  handleError: (
    errorOrCode: unknown | ErrorCode,
    message?: string,
    severity?: ErrorSeverity,
    context?: Record<string, unknown>
  ) => void;
  clearError: () => void;
}

/**
 * Hook pour gérer les erreurs de manière standardisée
 */
export function useError(): UseErrorReturn {
  const [error, setError] = useState<ErrorDetails | null>(null);

  // Fonction pour gérer une erreur
  const handleError = useCallback(
    (
      errorOrCode: unknown | ErrorCode,
      message?: string,
      severity?: ErrorSeverity,
      context?: Record<string, unknown>
    ) => {
      const errorDetails = errorService.handleError(
        errorOrCode,
        message,
        severity,
        context
      );
      setError(errorDetails);
      return errorDetails;
    },
    []
  );

  // Fonction pour effacer l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Écouter les erreurs globales
  useEffect(() => {
    const errorListener: ErrorListener = (errorDetails) => {
      // Ne mettre à jour l'état que si l'erreur n'a pas déjà été gérée par ce hook
      if (!error || error.timestamp !== errorDetails.timestamp) {
        setError(errorDetails);
      }
    };

    errorService.addErrorListener(errorListener);

    return () => {
      errorService.removeErrorListener(errorListener);
    };
  }, [error]);

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
  };
}

/**
 * Fonction utilitaire pour gérer les erreurs en dehors des composants React
 */
export function handleGlobalError(
  errorOrCode: unknown | ErrorCode,
  message?: string,
  severity?: ErrorSeverity,
  context?: Record<string, unknown>
): ErrorDetails {
  return errorService.handleError(errorOrCode, message, severity, context);
}
