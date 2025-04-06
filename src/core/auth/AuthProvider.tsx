import React, { createContext, ReactNode, useState, useEffect } from "react";
import { User } from "firebase/auth";
import { authService } from "./services/AuthService";
import { AuthType } from "./services/AuthServiceBase";
import { logger } from "../logger";

/**
 * Interface pour le contexte d'authentification
 */
export interface AuthContextValue {
  user: User | any | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  authType: AuthType | null;
}

/**
 * Contexte d'authentification
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Props pour le provider d'authentification
 */
interface AuthProviderProps {
  children: ReactNode;
  onAuthStateChanged?: (user: User | any | null) => void;
  onError?: (error: Error) => void;
}

/**
 * Provider d'authentification unifié
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onAuthStateChanged,
  onError,
}) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [authType, setAuthType] = useState<AuthType | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier l'état d'authentification actuel
        const currentUser = await authService.getCurrentUser();
        const currentAuthType = authService.getCurrentAuthType();

        setUser(currentUser);
        setAuthType(currentAuthType);
        setIsLoading(false);

        if (onAuthStateChanged) {
          onAuthStateChanged(currentUser);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);

        logger.error({
          category: "Auth",
          message: "Erreur lors de l'initialisation de l'authentification",
          error,
        });

        if (onError) {
          onError(error);
        }
      }
    };

    // Écouter les changements d'état d'authentification
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      const checkAllAuth = async () => {
        try {
          // Obtenir l'utilisateur actuel (Firebase ou Web3)
          const currentUser = await authService.getCurrentUser();
          const currentAuthType = authService.getCurrentAuthType();

          setUser(currentUser);
          setAuthType(currentAuthType);
          setIsLoading(false);

          if (onAuthStateChanged) {
            onAuthStateChanged(currentUser);
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setIsLoading(false);

          logger.error({
            category: "Auth",
            message: "Erreur lors du changement d'état d'authentification",
            error,
          });

          if (onError) {
            onError(error);
          }
        }
      };

      checkAllAuth();
    });

    // Initialiser l'authentification
    initializeAuth();

    return () => {
      unsubscribe();
    };
  }, [onAuthStateChanged, onError]);

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    authType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
