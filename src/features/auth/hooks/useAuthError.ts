import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { setAuthError, clearAuthError } from "../store/authSlice";
import { AuthError } from "../errors/AuthError";
import { logger } from "@/core/logger";
import { monitoringService } from "@/utils/monitoring";

export const useAuthError = () => {
  const dispatch = useDispatch();

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      if (error instanceof AuthError) {
        // Logger l'erreur avec le contexte
        logger.error(
          `Erreur d'authentification${context ? ` (${context})` : ""}:`,
          {
            code: error.code,
            message: error.message,
            details: error.details,
            context,
          },
          error
        );

        // Envoyer au service de monitoring
        monitoringService.trackAuthError(error);

        // Mettre à jour le state
        dispatch(
          setAuthError({
            code: error.code,
            message: error.message,
          })
        );

        return error;
      }

      if (error instanceof Error) {
        // Logger l'erreur générique
        logger.error(
          `Erreur non gérée${context ? ` (${context})` : ""}:`,
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context,
          },
          error
        );

        // Créer et dispatcher une erreur générique
        const authError = new AuthError(
          "UNKNOWN_ERROR",
          "Une erreur inattendue est survenue.",
          { originalError: error }
        );

        dispatch(
          setAuthError({
            code: authError.code,
            message: authError.message,
          })
        );

        return authError;
      }

      // Logger l'erreur inconnue
      logger.error(`Erreur inconnue${context ? ` (${context})` : ""}:`, {
        error,
        context,
      });

      // Créer et dispatcher une erreur générique
      const authError = new AuthError(
        "UNKNOWN_ERROR",
        "Une erreur inconnue est survenue.",
        { originalError: error }
      );

      dispatch(
        setAuthError({
          code: authError.code,
          message: authError.message,
        })
      );

      return authError;
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    handleError,
    clearError,
  };
};
