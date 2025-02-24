import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AUTH_PERSISTENCE } from '@/config/constants';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Set auth persistence
    auth.setPersistence(AUTH_PERSISTENCE);

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
      setIsLoading(false);

      if (user) {
        dispatch({ type: 'auth/setUser', payload: user });
      } else {
        dispatch({ type: 'auth/clearUser' });
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const value = {
    isAuthenticated: !!userId,
    isLoading,
    userId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 