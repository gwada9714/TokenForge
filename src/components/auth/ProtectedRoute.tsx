import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { CircularProgress, Box, Alert, Typography } from '@mui/material';
import { useAccount, useNetwork } from 'wagmi';
import { useContract } from '../../contexts/ContractContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { address, isConnecting } = useAccount();
  const { chain } = useNetwork();
  const { isOwner, isLoading: adminLoading } = useTokenForgeAdmin();
  const { networkStatus, isLoading: contractLoading, error: contractError } = useContract();

  // Afficher un indicateur de chargement pendant la connexion ou le chargement du contrat
  if (isConnecting || contractLoading || (requireAdmin && adminLoading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Rediriger vers la page d'accueil si l'utilisateur n'est pas connecté
  if (!address) {
    return <Navigate to="/" replace />;
  }

  // Afficher une erreur si le réseau n'est pas correct
  if (networkStatus === 'wrong_network') {
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
        <Typography variant="body2" color="textSecondary">
          Réseau actuel : {chain?.name || 'Inconnu'}
        </Typography>
      </Box>
    );
  }

  // Afficher une erreur de contrat si présente
  if (contractError) {
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
          {contractError}
        </Alert>
      </Box>
    );
  }

  // Vérifier les conditions pour l'accès admin
  if (requireAdmin && !isOwner) {
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
        <Alert severity="warning">
          Accès réservé à l'administrateur
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
