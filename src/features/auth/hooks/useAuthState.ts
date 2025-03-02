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
    const unsubscribe = firebaseAuth.onAuthStateChanged((firebaseUser) => {
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

    return () => unsubscribe();
  }, []);

  return authState;
}
