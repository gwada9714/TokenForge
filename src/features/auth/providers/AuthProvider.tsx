import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { firebaseService } from '@/config/firebase/index';
import { logger } from '@/core/logger';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await firebaseService.initialize();
        const auth = firebaseService.getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setIsLoading(false);
        }, (error) => {
          setError(error);
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        logger.error({
          category: 'Auth',
          message: 'Error initializing auth',
          error: error instanceof Error ? error : new Error(String(error))
        });
        setError(error instanceof Error ? error : new Error(String(error)));
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
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
