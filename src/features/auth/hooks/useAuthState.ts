import { useEffect } from 'react';
import { useTokenForgeAuth } from '../providers/TokenForgeAuthProvider';
import { firebaseAuth } from '../services/firebaseAuth';
import { errorService } from '../services/errorService';
import { authActions } from '../store/authActions';

export function useAuthState() {
  const { user, isAuthenticated, loading, error, dispatch } = useTokenForgeAuth();

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        dispatch(authActions.loginSuccess({
          ...firebaseUser,
          isAdmin: false, // Sera mis à jour par le sessionService
          canCreateToken: false
        }));
      } else {
        dispatch(authActions.logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error
  };
}
