import { useEffect, useState } from 'react';
import { firebaseAuth } from '../services/firebaseAuth';

interface AuthState {
  user: any;
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
        // Obtenir la fonction de désabonnement de manière asynchrone
        unsubscribeFunction = await firebaseAuth.onAuthStateChanged((firebaseUser) => {
          if (firebaseUser) {
            setAuthState({
              user: {
                ...firebaseUser,
                isAdmin: false, // Sera mis à jour par le sessionService
                canCreateToken: false
              },
              isAuthenticated: true,
              loading: false,
              error: null
            });
          } else {
            setAuthState({
              user: null,
              isAuthenticated: false,
              loading: false,
              error: null
            });
          }
        });
      } catch (error) {
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
        unsubscribeFunction();
      }
    };
  }, []);

  return authState;
}
