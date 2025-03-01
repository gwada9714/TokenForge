import { useState, useEffect } from 'react';
import { firebaseAuth } from '../features/auth/services/firebaseAuth';

interface AuthUser {
  uid: string;
  address: string;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logique d'authentification à implémenter
    const checkAuth = async () => {
      try {
        setLoading(true);
        firebaseAuth.onAuthStateChanged((user) => {
          if (user) {
            setUser({ 
              uid: user.uid,
              address: user.email || '', 
              isAdmin: false 
            });
          }
        });
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await firebaseAuth.signIn(email, password);
      setUser({ 
        uid: userCredential.user.uid,
        address: userCredential.user.email || '', 
        isAdmin: false 
      }); // Assurer que l'adresse est une chaîne
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Implémenter la logique de déconnexion
  };

  return {
    user,
    loading,
    login,
    logout,
  };
};

export default useAuth;
