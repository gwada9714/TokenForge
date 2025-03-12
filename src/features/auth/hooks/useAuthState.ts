import { useEffect, useState } from 'react';
import { firebaseAuth } from '@/lib/firebase/auth';
import { User } from 'firebase/auth';
import { logger } from '@/core/logger';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
}

export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    let unsubscribeFunction: (() => void) | null = null;
    
    // Fonction pour gérer les changements d'état d'authentification
    const handleAuthStateChanges = async () => {
      try {
        logger.debug({
          category: 'Auth',
          message: 'Configuration de l\'écouteur d\'état d\'authentification'
        });
        
        // Obtenir la fonction de désabonnement de manière asynchrone via le service Firebase modernisé
        const auth = await firebaseAuth.getAuth();
        unsubscribeFunction = auth.onAuthStateChanged((firebaseUser) => {
          if (firebaseUser) {
            logger.info({
              category: 'Auth',
              message: 'Utilisateur connecté',
              data: { uid: firebaseUser.uid, email: firebaseUser.email }
            });
            
            setAuthState({
              user: firebaseUser,
              isAuthenticated: true,
              loading: false,
              error: null
            });
          } else {
            logger.info({
              category: 'Auth',
              message: 'Utilisateur déconnecté'
            });
            
            setAuthState({
              user: null,
              isAuthenticated: false,
              loading: false,
              error: null
            });
          }
        });
      } catch (error) {
        logger.error({
          category: 'Auth',
          message: 'Erreur lors de la configuration de l\'écouteur d\'état d\'authentification',
          error: error instanceof Error ? error : new Error(String(error))
        });
        
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error as Error
        }));
      }
    };

    // Initialiser l'abonnement
    handleAuthStateChanges();

    // Fonction de nettoyage
    return () => {
      if (unsubscribeFunction) {
        logger.debug({
          category: 'Auth',
          message: 'Désabonnement de l\'écouteur d\'état d\'authentification'
        });
        unsubscribeFunction();
      }
    };
  }, []);

  return authState;
}
