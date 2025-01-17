import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { CircularProgress, Box } from '@mui/material';
import { useContract } from '../../providers/ContractProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading, error: adminError } = useTokenForgeAdmin();
  const { isLoading: contractLoading, error: contractError } = useContract();
  const location = useLocation();

  // Afficher un indicateur de chargement pendant que les données sont chargées
  if (authLoading || (requireAdmin && (adminLoading || contractLoading))) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Gérer les erreurs de contrat pour les routes admin
  if (requireAdmin && (contractError || adminError)) {
    console.error('Admin access error:', { contractError, adminError });
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2,
        padding: 2,
        textAlign: 'center'
      }}>
        <div>Error: {contractError || adminError}</div>
        <div>Please make sure you are:</div>
        <ul>
          <li>Connected to the Sepolia network</li>
          <li>Using the correct wallet address</li>
          <li>Have the necessary admin permissions</li>
        </ul>
      </Box>
    );
  }

  // Rediriger si l'utilisateur n'a pas les droits admin nécessaires
  if (requireAdmin && !isAdmin && location.pathname === '/admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
