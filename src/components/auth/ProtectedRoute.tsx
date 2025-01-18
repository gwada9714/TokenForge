import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { CircularProgress, Box, Alert } from '@mui/material';
import { useAccount, useNetwork } from 'wagmi';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { address, isConnecting } = useAccount();
  const { chain } = useNetwork();
  const { isOwner, isLoading: adminLoading } = useTokenForgeAdmin();

  // Afficher un indicateur de chargement pendant la connexion
  if (isConnecting || (requireAdmin && adminLoading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Rediriger vers la page d'accueil si l'utilisateur n'est pas connecté
  if (!address) {
    return <Navigate to="/" />;
  }

  // Vérifier le réseau
  const isCorrectNetwork = chain?.id === 11155111; // Sepolia

  // Vérifier les conditions pour l'accès admin
  if (requireAdmin) {
    if (!isCorrectNetwork) {
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
          <Alert severity="error">
            Veuillez vous connecter au réseau Sepolia (Chain ID: 11155111)
          </Alert>
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
          padding: 2,
          textAlign: 'center'
        }}>
          <Alert severity="error">
            Vous n'avez pas les droits d'administration
          </Alert>
        </Box>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
