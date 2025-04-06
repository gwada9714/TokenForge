import { useContext, useCallback, useState } from "react";
import { AuthContext } from "../AuthProvider";
import { AuthService } from "../services/AuthService";
import { LoginCredentials, AuthResponse } from "../types/auth.types";
import { logger } from "@/core/logger";

/**
 * Hook personnalisé pour accéder au contexte d'authentification et aux fonctions associées
 */
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  const authService = AuthService.getInstance();
  const [authError, setAuthError] = useState<Error | null>(null);

  if (!authContext) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }

  /**
   * Fonction de connexion avec gestion d'erreur améliorée
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setAuthError(null);
      try {
        const response = await authService.login(credentials);
        if (!response.success && response.error) {
          setAuthError(response.error);
        }
        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Auth", "Échec de connexion", err);
        setAuthError(err);
        return {
          success: false,
          error: err,
          user: undefined,
        };
      }
    },
    []
  );

  /**
   * Fonction de déconnexion avec gestion d'erreur améliorée
   */
  const logout = useCallback(async (): Promise<boolean> => {
    setAuthError(null);
    try {
      await authService.logout();
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Auth", "Échec de déconnexion", err);
      setAuthError(err);
      return false;
    }
  }, []);

  /**
   * Fonction pour vérifier si l'utilisateur est connecté
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Vérifier si l'utilisateur est authentifié selon le contexte
      return authContext.isAuthenticated;
    } catch (error) {
      logger.error(
        "Auth",
        "Erreur lors de la vérification de l'authentification",
        error
      );
      return false;
    }
  }, [authContext.isAuthenticated]);

  /**
   * Fonction pour réinitialiser les erreurs d'authentification
   */
  const resetAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return {
    ...authContext,
    login,
    logout,
    checkAuth,
    authError,
    resetAuthError,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    userId: authContext.userId,
    sessionState: authContext.sessionState,
  };
};
