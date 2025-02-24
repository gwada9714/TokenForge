import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/AuthService';
import { AuthState } from '../types';
import { logger } from '@/core/logger/Logger';

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const authService = AuthService.getInstance();
    const auth = authService.getFirebaseAuth();

    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setAuthState({
          user,
          loading: false,
          error: null
        });
        logger.info('AuthProvider', 'Auth state updated', { userId: user?.uid });
      },
      (error) => {
        setAuthState({
          user: null,
          loading: false,
          error
        });
        logger.error('AuthProvider', 'Auth state error', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
