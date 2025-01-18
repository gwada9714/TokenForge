import React from 'react';
import { Alert, Box, CircularProgress, Typography, Stack, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { NetworkStatus } from './NetworkStatus';
import { WalletStatus } from './WalletStatus';
import { ContractStatus } from './ContractStatus';
import { ContractPauseStatus } from './ContractPauseStatus';
import { AdminRights } from './AdminRights';

export const AdminCheck: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const {
    isAdmin,
    error,
    isLoading,
    networkCheck,
    walletCheck,
    contractCheck,
    handleRetryCheck,
    lastActivity
  } = useTokenForgeAdmin();

  // État de chargement
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <Box sx={{ width: '100%', p: 2 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetryCheck}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>État des vérifications :</Typography>
          <Stack spacing={1}>
            <Typography>
              Réseau : {networkCheck?.isCorrectNetwork ? '✅' : '❌'} {networkCheck?.networkName || 'Non connecté'}
            </Typography>
            <Typography>
              Wallet : {walletCheck?.isConnected ? '✅' : '❌'} {walletCheck?.currentAddress || 'Non connecté'}
            </Typography>
            <Typography>
              Contrat : {contractCheck?.isValid ? '✅' : '❌'} {contractCheck?.error || ''}
            </Typography>
            <Typography>
              Dernière activité : {lastActivity ? new Date(lastActivity).toLocaleString() : 'Jamais'}
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  }

  // Vérification des droits admin
  if (!isAdmin) {
    return (
      <Box sx={{ width: '100%', p: 2 }}>
        <Alert severity="warning">
          Vous n'avez pas les droits administrateur nécessaires.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Veuillez vous connecter avec un compte administrateur.
          </Typography>
        </Box>
      </Box>
    );
  }

  // Affichage du contenu admin
  return <>{children}</>;
};
