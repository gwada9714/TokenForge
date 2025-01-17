import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { CircularProgress, Box, Alert } from '@mui/material';
import { useContract } from '../../providers/ContractProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { isOwner, error: adminError, isCorrectNetwork } = useTokenForgeAdmin();
  const { isLoading: contractLoading, error: contractError } = useContract();
  const location = useLocation();

  // Afficher un indicateur de chargement pendant que les données sont chargées
  if (authLoading || (requireAdmin && contractLoading)) {
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

  // Vérifier les conditions pour l'accès admin
  if (requireAdmin) {
    if (!isCorrectNetwork || contractError || adminError) {
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
          {!isCorrectNetwork && (
            <Alert severity="error">
              Please connect to the Sepolia network (Chain ID: 11155111)
            </Alert>
          )}
          {(contractError || adminError) && (
            <Alert severity="error">
              {contractError || adminError || 'Error accessing admin features'}
            </Alert>
          )}
          <div>Please make sure you are:</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✓ Connected to the Sepolia network</li>
            <li>✓ Using the correct wallet address</li>
            <li>✓ The contract owner</li>
          </ul>
        </Box>
      );
    }

    if (!isOwner) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2,
          padding: 2
        }}>
          <Alert severity="error">
            Access Denied: Only the contract owner can access this page
          </Alert>
        </Box>
      );
    }
  }

  return <>{children}</>;
};
