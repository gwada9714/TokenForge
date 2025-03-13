import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase/auth';
import { logger } from '../core/logger';

// Type pour l'utilisateur authentifié avec des informations supplémentaires
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
  // Champs personnalisés pour l'application
  isAdmin?: boolean;
  address?: string; // Pour la compatibilité avec l'existant
  metadata?: Record<string, unknown>;
}

// État de l'authentification
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// Options du hook
interface UseAuthOptions {
  onAuthStateChanged?: (user: AuthUser | null) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour gérer l'authentification Firebase
 */
export const useAuth = (options: UseAuthOptions = {}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Convertir l'utilisateur Firebase en AuthUser
  const mapUserToAuthUser = useCallback((firebaseUser: User | null): AuthUser | null => {
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isAnonymous: firebaseUser.isAnonymous,
      emailVerified: firebaseUser.emailVerified,
      // Champs personnalisés - à adapter selon les besoins
      isAdmin: false, // Par défaut, à remplacer par une logique métier
      address: firebaseUser.email || '',
    };
  }, []);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    setStatus('loading');
    let unsubscribe: (() => void) | null = null;

    const setupAuthListener = async () => {
      try {
        const auth = await firebaseAuth.getAuth();
        
        unsubscribe = onAuthStateChanged(
          auth,
          (firebaseUser) => {
            const mappedUser = mapUserToAuthUser(firebaseUser);
            setAuthUser(firebaseUser);
            setUser(mappedUser);
            setStatus(mappedUser ? 'authenticated' : 'unauthenticated');
            
            // Appeler le callback si fourni
            if (options.onAuthStateChanged) {
              options.onAuthStateChanged(mappedUser);
            }
          },
          (err) => {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error({
              category: 'useAuth',
              message: 'Erreur lors du suivi de l\'état d\'authentification',
              error
            });
            setError(error);
            setStatus('error');
            
            // Appeler le callback d'erreur si fourni
            if (options.onError) {
              options.onError(error);
            }
          }
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({
          category: 'useAuth',
          message: 'Erreur lors de l\'initialisation de l\'authentification',
          error
        });
        setError(error);
        setStatus('error');
      }
    };

    setupAuthListener();

    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [mapUserToAuthUser, options.onAuthStateChanged, options.onError]);

  // Connexion avec email et mot de passe
  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    try {
      setStatus('loading');
      setError(null);
      
      const user = await firebaseAuth.signIn(email, password);
      const mappedUser = mapUserToAuthUser(user);
      
      if (!mappedUser) {
        throw new Error('Échec de connexion: utilisateur non défini');
      }
      
      return mappedUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        category: 'useAuth',
        message: 'Erreur lors de la connexion',
        error
      });
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [mapUserToAuthUser]);

  // Inscription avec email et mot de passe
  const signUp = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    try {
      setStatus('loading');
      setError(null);
      
      const user = await firebaseAuth.signUp(email, password);
      const mappedUser = mapUserToAuthUser(user);
      
      if (!mappedUser) {
        throw new Error('Échec d\'inscription: utilisateur non défini');
      }
      
      return mappedUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        category: 'useAuth',
        message: 'Erreur lors de l\'inscription',
        error
      });
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [mapUserToAuthUser]);

  // Connexion anonyme
  const signInAnonymously = useCallback(async (): Promise<AuthUser> => {
    try {
      setStatus('loading');
      setError(null);
      
      const user = await firebaseAuth.signInAnonymously();
      const mappedUser = mapUserToAuthUser(user);
      
      if (!mappedUser) {
        throw new Error('Échec de connexion anonyme: utilisateur non défini');
      }
      
      return mappedUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        category: 'useAuth',
        message: 'Erreur lors de la connexion anonyme',
        error
      });
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [mapUserToAuthUser]);

  // Déconnexion
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setStatus('loading');
      setError(null);
      
      await firebaseAuth.signOut();
      // Le changement d'état sera géré par l'écouteur onAuthStateChanged
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        category: 'useAuth',
        message: 'Erreur lors de la déconnexion',
        error
      });
      setError(error);
      setStatus('error');
      throw error;
    }
  }, []);

  // Réinitialisation du mot de passe
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setStatus('loading');
      setError(null);
      
      await firebaseAuth.resetPassword(email);
      setStatus(user ? 'authenticated' : 'unauthenticated');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        category: 'useAuth',
        message: 'Erreur lors de la réinitialisation du mot de passe',
        error
      });
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [user]);

  // Mise à jour du profil
  const updateUserProfile = useCallback(async (profileData: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      setStatus('loading');
      setError(null);
      
      await firebaseAuth.updateProfile(profileData);
      // Le changement d'état sera géré par l'écouteur onAuthStateChanged
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        category: 'useAuth',
        message: 'Erreur lors de la mise à jour du profil',
        error
      });
      setError(error);
      setStatus('error');
      throw error;
    }
  }, []);

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = status === 'authenticated' && !!user;

  // Vérifier si l'utilisateur est administrateur
  const isAdmin = isAuthenticated && !!user?.isAdmin;

  return {
    user,
    authUser, // Utilisateur Firebase brut pour les cas avancés
    status,
    error,
    isAuthenticated,
    isAdmin,
    isLoading: status === 'loading',
    // Méthodes d'authentification
    signIn,
    signUp,
    signInAnonymously,
    signOut,
    resetPassword,
    updateUserProfile,
  };
};

export default useAuth;
