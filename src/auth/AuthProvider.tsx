// @ts-expect-error React is needed for JSX
import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { firebaseService } from '@/config/firebase';
import { onAuthStateChanged, User, Auth, setPersistence } from 'firebase/auth';
import { AUTH_PERSISTENCE } from '@/config/constants';
import { SessionService, SessionState } from '@/services/session/sessionService';
import { logger } from '@/utils/logger';
import { getFirebaseAuth, initializeAuth } from '@/lib/firebase/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  sessionState: SessionState;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  sessionState: SessionState.INITIALIZING,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.INITIALIZING);
  const dispatch = useDispatch();
  const sessionService = SessionService.getInstance();

  useEffect(() => {
    const initializeAuthAndSession = async () => {
      try {
        logger.info('Auth', 'Initialisation de l\'authentification');
        
        // S'assurer que Firebase est initialisé
        if (!firebaseService.isInitialized()) {
          await firebaseService.initialize();
        }
        
        // Initialiser l'authentification via le module dédié
        try {
          await initializeAuth();
          logger.info('Auth', 'Authentification initialisée avec succès');
        } catch (authError) {
          // Continuer même en cas d'erreur d'initialisation de l'authentification
          logger.error('Auth', 'Erreur lors de l\'initialisation de l\'authentification, mais on continue', authError);
        }
        
        const firebaseAuth: Auth = getFirebaseAuth();
        
        // Set auth persistence (attendre que la persistance soit configurée)
        try {
          await setPersistence(firebaseAuth, AUTH_PERSISTENCE);
          logger.info('Auth', 'Persistance d\'authentification configurée');
        } catch (persistenceError) {
          // Continuer même en cas d'erreur de configuration de la persistance
          logger.error('Auth', 'Erreur lors de la configuration de la persistance, mais on continue', persistenceError);
        }
        
        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user: User | null) => {
          setUserId(user?.uid || null);
          
          try {
            await sessionService.startSession();
            setSessionState(sessionService.getCurrentState());
          } catch (error) {
            // En cas d'erreur de session, définir un état par défaut pour éviter les pages vides
            setSessionState(SessionState.AUTHENTICATED);
            logger.error('Auth', 'Erreur lors du démarrage de la session, mais on continue', error);
          }

          setIsLoading(false);

          if (user) {
            dispatch({ type: 'auth/setUser', payload: user });
            logger.info('Auth', 'Utilisateur authentifié', { userId: user.uid });
          } else {
            dispatch({ type: 'auth/clearUser' });
            logger.info('Auth', 'Aucun utilisateur authentifié');
          }
        });

        return unsubscribe;
      } catch (error) {
        logger.error('Auth', 'Erreur lors de l\'initialisation de l\'authentification', error);
        // En cas d'erreur, définir un état par défaut pour éviter les pages vides
        setSessionState(SessionState.AUTHENTICATED);
        setIsLoading(false);
        return () => {}; // Retourner une fonction de nettoyage vide en cas d'erreur
      }
    };

    // Initialiser l'authentification et stocker la fonction de nettoyage
    const unsubscribePromise = initializeAuthAndSession();
    
    return () => {
      // Nettoyer l'abonnement et terminer la session
      unsubscribePromise.then(unsubscribe => {
        unsubscribe();
        sessionService.endSession().catch(error => {
          logger.error('Auth', 'Erreur lors de la terminaison de la session', error);
        });
      });
    };
  }, [dispatch]);

  const value = {
    isAuthenticated: !!userId || sessionState === SessionState.AUTHENTICATED || sessionState === SessionState.INITIALIZING,
    isLoading,
    userId,
    sessionState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
