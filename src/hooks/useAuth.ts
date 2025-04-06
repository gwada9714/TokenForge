import { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { authService } from "../core/auth/services/AuthService";
import {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  AuthType,
} from "../core/auth/services/AuthServiceBase";
import { Web3Credentials } from "../core/auth/services/Web3AuthService";
import { useError } from "./useError";
import { logger } from "../core/logger";

/**
 * État de l'authentification
 */
export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

/**
 * Options du hook useAuth
 */
export interface UseAuthOptions {
  onAuthStateChanged?: (user: User | any | null) => void;
  onError?: (error: Error) => void;
  requireEmailVerification?: boolean;
}

/**
 * Hook pour gérer l'authentification
 */
export function useAuth(options: UseAuthOptions = {}) {
  const [user, setUser] = useState<User | any | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const { error, handleError, clearError } = useError();
  const [authType, setAuthType] = useState<AuthType | null>(null);

  // Effet pour écouter les changements d'état d'authentification
  useEffect(() => {
    setStatus("loading");

    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      // Vérifier également l'authentification Web3
      const checkAllAuth = async () => {
        try {
          // Obtenir l'utilisateur actuel (Firebase ou Web3)
          const currentUser = await authService.getCurrentUser();
          const currentAuthType = authService.getCurrentAuthType();

          setUser(currentUser);
          setAuthType(currentAuthType);
          setStatus(currentUser ? "authenticated" : "unauthenticated");

          if (options.onAuthStateChanged) {
            options.onAuthStateChanged(currentUser);
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          handleError(error);
          setStatus("error");

          if (options.onError) {
            options.onError(error);
          }
        }
      };

      checkAllAuth();
    });

    return () => {
      unsubscribe();
    };
  }, [handleError, options.onAuthStateChanged, options.onError]);

  /**
   * Connexion avec email et mot de passe
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      try {
        setStatus("loading");
        clearError();

        const credentials: LoginCredentials = { email, password };
        const response = await authService.login(
          credentials,
          AuthType.EMAIL_PASSWORD
        );

        if (response.success) {
          setUser(response.user);
          setAuthType(AuthType.EMAIL_PASSWORD);
          setStatus("authenticated");
        } else {
          setStatus("error");
          if (response.error) {
            handleError(response.error);
          }
        }

        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        handleError(error);
        setStatus("error");

        return {
          success: false,
          error,
        };
      }
    },
    [clearError, handleError]
  );

  /**
   * Connexion avec Web3
   */
  const signInWithWeb3 = useCallback(
    async (address?: string): Promise<AuthResponse> => {
      try {
        setStatus("loading");
        clearError();

        const credentials: Web3Credentials = { address: address || "" };
        const response = await authService.login(credentials, AuthType.WEB3);

        if (response.success) {
          setUser(response.user);
          setAuthType(AuthType.WEB3);
          setStatus("authenticated");
        } else {
          setStatus("error");
          if (response.error) {
            handleError(response.error);
          }
        }

        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        handleError(error);
        setStatus("error");

        return {
          success: false,
          error,
        };
      }
    },
    [clearError, handleError]
  );

  /**
   * Inscription avec email et mot de passe
   */
  const signUp = useCallback(
    async (credentials: SignupCredentials): Promise<AuthResponse> => {
      try {
        setStatus("loading");
        clearError();

        const response = await authService.signup(credentials);

        if (response.success) {
          // Si l'email de vérification est requis, l'utilisateur ne sera pas connecté immédiatement
          if (options.requireEmailVerification) {
            setStatus("unauthenticated");
            setUser(null);
          } else {
            setUser(response.user);
            setAuthType(AuthType.EMAIL_PASSWORD);
            setStatus("authenticated");
          }
        } else {
          setStatus("error");
          if (response.error) {
            handleError(response.error);
          }
        }

        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        handleError(error);
        setStatus("error");

        return {
          success: false,
          error,
        };
      }
    },
    [clearError, handleError, options.requireEmailVerification]
  );

  /**
   * Déconnexion
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setStatus("loading");
      clearError();

      await authService.logout();

      setUser(null);
      setAuthType(null);
      setStatus("unauthenticated");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      handleError(error);
      setStatus("error");
      throw error;
    }
  }, [clearError, handleError]);

  /**
   * Réinitialisation du mot de passe
   */
  const resetPassword = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        clearError();

        const success = await authService.resetPassword(email);

        return success;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        handleError(error);
        throw error;
      }
    },
    [clearError, handleError]
  );

  /**
   * Mise à jour du profil utilisateur
   */
  const updateUserProfile = useCallback(
    async (profile: Partial<SignupCredentials>): Promise<User | null> => {
      try {
        clearError();

        if (!user) {
          throw new Error("Aucun utilisateur connecté");
        }

        const updatedUser = await authService.updateUserProfile(user, profile);
        setUser(updatedUser);

        return updatedUser;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        handleError(error);
        throw error;
      }
    },
    [clearError, handleError, user]
  );

  /**
   * Obtention d'un token d'authentification
   */
  const getToken = useCallback(
    async (forceRefresh: boolean = false): Promise<string | null> => {
      try {
        return await authService.getToken(forceRefresh);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({
          category: "Auth",
          message: "Erreur lors de l'obtention du token",
          error,
        });
        return null;
      }
    },
    []
  );

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = status === "authenticated" && !!user;

  // Vérifier si l'utilisateur est administrateur (à adapter selon votre logique)
  const isAdmin = isAuthenticated && !!user?.isAdmin;

  // Vérifier si l'utilisateur utilise Web3
  const isWeb3 = authType === AuthType.WEB3;

  return {
    user,
    status,
    error,
    isAuthenticated,
    isAdmin,
    isWeb3,
    isLoading: status === "loading",
    authType,
    // Méthodes d'authentification
    signIn,
    signInWithWeb3,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    getToken,
    clearError,
  };
}

export default useAuth;
