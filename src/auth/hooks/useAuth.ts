import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '../services/AuthService';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const auth = AuthService.getInstance();
    const unsubscribe = auth.auth.onAuthStateChanged(
      (user) => {
        setState({ user, loading: false, error: null });
      },
      (error) => {
        setState({ user: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await AuthService.getInstance().login(email, password);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      }));
      throw error;
    }
  };

  return { ...state, login };
};
