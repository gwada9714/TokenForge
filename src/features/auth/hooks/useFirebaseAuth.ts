import { useEffect, useState, useCallback, useRef } from "react";
import { getFirebaseAuthService } from "../services/firebaseAuth";
import { TokenForgeUser } from "../../../types/authTypes";
import { logger, LogLevel } from "../../../core/logger";

interface AuthState {
  user: TokenForgeUser | null;
  isLoading: boolean;
  error: Error | null;
}

export const useFirebaseAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const authServiceRef = useRef<Awaited<
    ReturnType<typeof getFirebaseAuthService>
  > | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Obtenir l'instance du service d'authentification
        authServiceRef.current = await getFirebaseAuthService();

        // Nettoyer l'ancien listener si présent
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }

        // Configurer le nouveau listener
        unsubscribeRef.current = authServiceRef.current.onAuthStateChange(
          (user) => {
            setState({
              user,
              isLoading: false,
              error: null,
            });
          }
        );

        // Initialiser avec l'utilisateur actuel
        const currentUser = authServiceRef.current.getCurrentUser();
        setState({
          user: currentUser,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        logger.log(
          LogLevel.ERROR,
          "Erreur lors de l'initialisation de l'authentification:",
          error
        );
        setState({
          user: null,
          isLoading: false,
          error: error as Error,
        });
      }
    };

    initializeAuth();

    // Nettoyage
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!authServiceRef.current)
      throw new Error("Service d'authentification non initialisé");

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const user = await authServiceRef.current.signInWithEmail(
        email,
        password
      );
      setState({ user, isLoading: false, error: null });
      return user;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!authServiceRef.current)
      throw new Error("Service d'authentification non initialisé");

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const user = await authServiceRef.current.signInWithGoogle();
      setState({ user, isLoading: false, error: null });
      return user;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!authServiceRef.current)
      throw new Error("Service d'authentification non initialisé");

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const user = await authServiceRef.current.createUser(email, password);
      setState({ user, isLoading: false, error: null });
      return user;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!authServiceRef.current)
      throw new Error("Service d'authentification non initialisé");

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authServiceRef.current.signOut();
      setState({ user: null, isLoading: false, error: null });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!authServiceRef.current)
      throw new Error("Service d'authentification non initialisé");

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authServiceRef.current.resetPassword(email);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(
    async (displayName: string, photoURL?: string) => {
      if (!authServiceRef.current)
        throw new Error("Service d'authentification non initialisé");

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        await authServiceRef.current.updateUserProfile(displayName, photoURL);
        const updatedUser = authServiceRef.current.getCurrentUser();
        setState({ user: updatedUser, isLoading: false, error: null });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    []
  );

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };
};
