import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '@/config/firebase';
import { onAuthStateChanged, User, Auth, setPersistence } from 'firebase/auth';
import { AUTH_PERSISTENCE } from '@/config/constants';
import { SessionService, SessionState } from '@/services/session/sessionService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  sessionState: SessionState;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  sessionState: SessionState.INITIALIZING,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.INITIALIZING);
  const dispatch = useDispatch();
  const sessionService = SessionService.getInstance();

  useEffect(() => {
    const firebaseAuth: Auth = auth;
    
    // Set auth persistence
    setPersistence(firebaseAuth, AUTH_PERSISTENCE);

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user: User | null) => {
      setUserId(user?.uid || null);
      
      try {
        await sessionService.startSession();
        setSessionState(sessionService.getCurrentState());
      } catch (error) {
        setSessionState(SessionState.ERROR);
        console.error('Erreur lors du démarrage de la session:', error);
      }

      setIsLoading(false);

      if (user) {
        dispatch({ type: 'auth/setUser', payload: user });
      } else {
        dispatch({ type: 'auth/clearUser' });
      }
    });

    return () => {
      unsubscribe();
      sessionService.endSession().catch(console.error);
    };
  }, [dispatch]);

  const value = {
    isAuthenticated: !!userId && sessionState === SessionState.AUTHENTICATED,
    isLoading,
    userId,
    sessionState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 