import { QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  errorService,
  ErrorCode,
  ErrorSeverity,
} from "../core/errors/ErrorService";

// Configuration par défaut du QueryClient
const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        // Ne pas réessayer les erreurs ABI car elles sont probablement dues à une mauvaise configuration
        if (
          error instanceof Error &&
          error.name === "AbiEncodingLengthMismatchError"
        ) {
          errorService.handleError(
            ErrorCode.API_SERVER_ERROR,
            `Erreur d'encodage ABI: ${error.message}`,
            ErrorSeverity.ERROR,
            { source: "query", name: error.name }
          );
          return false;
        }

        // Réessayer les autres erreurs jusqu'à 2 fois
        errorService.handleError(
          ErrorCode.API_SERVER_ERROR,
          `Erreur de requête: ${
            error instanceof Error ? error.message : String(error)
          }`,
          ErrorSeverity.WARNING,
          { source: "query", attempt: failureCount }
        );
        return failureCount < 2;
      },
      staleTime: 5000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount: number, error: unknown) => {
        // Ne pas réessayer les erreurs ABI
        if (
          error instanceof Error &&
          error.name === "AbiEncodingLengthMismatchError"
        ) {
          errorService.handleError(
            ErrorCode.API_SERVER_ERROR,
            `Erreur d'encodage ABI dans une mutation: ${error.message}`,
            ErrorSeverity.ERROR,
            { source: "mutation", name: error.name }
          );
          return false;
        }

        errorService.handleError(
          ErrorCode.API_SERVER_ERROR,
          `Erreur de mutation: ${
            error instanceof Error ? error.message : String(error)
          }`,
          ErrorSeverity.WARNING,
          { source: "mutation", attempt: failureCount }
        );
        return failureCount < 1;
      },
    },
  },
};

// Instance singleton du QueryClient
let queryClientInstance: QueryClient | null = null;

/**
 * Crée ou récupère l'instance singleton du QueryClient
 */
function getQueryClientInstance(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient(defaultQueryClientConfig);
  }
  return queryClientInstance;
}

/**
 * Hook pour accéder au QueryClient
 * Utilise une instance singleton pour éviter de créer un nouveau client à chaque rendu
 */
export const useQueryClient = (): QueryClient => {
  // Utiliser useMemo pour garantir une référence stable
  return useMemo(() => getQueryClientInstance(), []);
};

/**
 * Réinitialise le QueryClient (utile pour les tests ou après déconnexion)
 */
export const resetQueryClient = (): void => {
  if (queryClientInstance) {
    queryClientInstance.clear();
    queryClientInstance = null;
  }
};
