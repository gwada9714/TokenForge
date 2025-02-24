import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '@/services/auth/AuthService';
import { AuthState } from '@/types/auth';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = AuthService.getInstance().onAuthStateChanged(
      (user) => setState({ user, loading: false, error: null }),
      (error) => setState(prev => ({ ...prev, loading: false, error }))
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await AuthService.getInstance().login(email, password);
      setState({ user, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await AuthService.getInstance().logout();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
    }
  };

  return {
    ...state,
    login,
    logout
  };
};
