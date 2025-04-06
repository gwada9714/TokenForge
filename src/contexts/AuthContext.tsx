import React, { createContext, useContext, ReactNode } from "react";
import { useAuth, AuthUser } from "../hooks/useAuth";

// Type pour le contexte d'authentification
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "error";
  error: Error | null;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (email: string, password: string) => Promise<AuthUser>;
  signInAnonymously: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (profileData: {
    displayName?: string;
    photoURL?: string;
  }) => Promise<void>;
}

// Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props pour le fournisseur de contexte
interface AuthProviderProps {
  children: ReactNode;
  onAuthStateChanged?: (user: AuthUser | null) => void;
  onError?: (error: Error) => void;
}

/**
 * Fournisseur de contexte d'authentification
 * Enveloppe l'application pour fournir l'accès à l'authentification
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onAuthStateChanged,
  onError,
}) => {
  // Utiliser le hook useAuth avec les callbacks fournis
  const auth = useAuth({
    onAuthStateChanged,
    onError,
  });

  // Fournir toutes les fonctionnalités d'authentification via le contexte
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * Hook pour utiliser le contexte d'authentification
 * @returns Contexte d'authentification
 * @throws Error si utilisé en dehors d'un AuthProvider
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuthContext doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }

  return context;
};

export default AuthProvider;
