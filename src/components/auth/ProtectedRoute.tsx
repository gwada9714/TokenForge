import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import { Box, Typography, Button } from '@mui/material';
import { CustomConnectButton } from '../ConnectWallet/CustomConnectButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWeb3?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireWeb3 = false,
  requireAdmin = false
}) => {
  const navigate = useNavigate();
  const { isConnected, isAdmin, isCorrectNetwork } = useWalletConnection();

  // Si Web3 est requis et que l'utilisateur n'est pas connecté
  if (requireWeb3 && !isConnected) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3,
        p: 4
      }}>
        <Typography variant="h5" gutterBottom>
          Connexion Requise
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Cette page nécessite une connexion à votre wallet pour accéder aux fonctionnalités Web3.
        </Typography>
        <CustomConnectButton />
        <Button 
          variant="text" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  // Si Web3 est requis et que le réseau n'est pas correct
  if (requireWeb3 && isConnected && !isCorrectNetwork) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3,
        p: 4
      }}>
        <Typography variant="h5" gutterBottom color="warning.main">
          Réseau Incorrect
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Veuillez vous connecter au réseau Sepolia pour accéder à cette page.
        </Typography>
        <CustomConnectButton />
      </Box>
    );
  }

  // Si les droits admin sont requis mais que l'utilisateur n'est pas admin
  if (requireAdmin && !isAdmin) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3,
        p: 4
      }}>
        <Typography variant="h5" gutterBottom color="error.main">
          Accès Restreint
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Cette page est réservée aux administrateurs.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          color="primary"
        >
          Retour à l'accueil
        </Button>
      </Box>
    );
  }

  // Si tout est OK, afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
