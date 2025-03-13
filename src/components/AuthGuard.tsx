import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallbackUrl?: string;
}

/**
 * Composant de garde d'authentification
 * Protège les routes qui nécessitent une authentification
 * 
 * @param children - Contenu à afficher si l'authentification est valide
 * @param requireAuth - Si true, l'utilisateur doit être authentifié
 * @param requireAdmin - Si true, l'utilisateur doit être administrateur
 * @param fallbackUrl - URL de redirection si l'authentification échoue
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallbackUrl = '/auth-demo'
}) => {
  const { isAuthenticated, isAdmin, status } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Ne rien faire tant que l'état d'authentification n'est pas déterminé
    if (status === 'idle' || status === 'loading') {
      return;
    }

    // Vérifier les conditions d'authentification
    const authFailed = requireAuth && !isAuthenticated;
    const adminFailed = requireAdmin && !isAdmin;

    // Rediriger si les conditions ne sont pas remplies
    if (authFailed || adminFailed) {
      navigate(fallbackUrl);
    }
  }, [isAuthenticated, isAdmin, status, requireAuth, requireAdmin, fallbackUrl, navigate]);

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (status === 'idle' || status === 'loading') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Vérification de l&apos;authentification...
        </Typography>
      </Box>
    );
  }

  // Afficher un message d'erreur si l'authentification a échoué
  if ((requireAuth && !isAuthenticated) || (requireAdmin && !isAdmin)) {
    return null; // Ne rien afficher, la redirection sera effectuée
  }

  // Afficher le contenu si l'authentification est valide
  return <>{children}</>;
};

export default AuthGuard;
