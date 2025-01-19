import React from 'react';
import { CircularProgress, Box, Alert, Typography } from '@mui/material';
import { useNetwork } from 'wagmi';
import { usePageAccess } from '../../hooks/usePageAccess';
import { CustomConnectButton } from '../ConnectWallet/CustomConnectButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { chain } = useNetwork();
  const { canAccess, isLoading, error } = usePageAccess(requireAdmin);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!canAccess) {
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
          {error || 'Accès non autorisé'}
        </Alert>
        {chain && (
          <Typography variant="body2" color="textSecondary">
            Réseau actuel : {chain.name || 'Inconnu'}
          </Typography>
        )}
        <CustomConnectButton />
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
