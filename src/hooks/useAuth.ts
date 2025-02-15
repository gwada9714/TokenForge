import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/auth/AuthService';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setAuthState({
        user,
        loading: false,
        error: null
      });
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.login(email, password);
      setAuthState({ user, loading: false, error: null });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.logout();
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
    }
  };

  return {
    ...authState,
    login,
    logout
  };
};
