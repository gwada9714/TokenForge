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
    adminRights,
    lastActivity
  } = useTokenForgeAdmin();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

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
          <h3>État des vérifications :</h3>
          <ul>
            <li>Réseau : {networkCheck.isCorrectNetwork ? '✅' : '❌'} {networkCheck.networkName || 'Non connecté'}</li>
            <li>Wallet : {walletCheck.isConnected ? '✅' : '❌'} {walletCheck.currentAddress || 'Non connecté'}</li>
            <li>Contrat : {contractCheck.isValid ? '✅' : '❌'} {contractCheck.error || ''}</li>
            <li>Droits : {adminRights.length > 0 ? '✅' : '❌'} {adminRights.join(', ') || 'Aucun droit'}</li>
            <li>Dernière activité : {lastActivity ? lastActivity.toLocaleString() : 'Jamais'}</li>
          </ul>
        </Box>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ width: '100%', p: 2 }}>
        <Alert severity="warning">
          Vous n'avez pas les droits d'administration nécessaires pour accéder à cette section.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, my: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" gutterBottom>
          Vérification de l'accès administrateur
          <Button 
            onClick={handleRetryCheck}
            size="small"
            sx={{ ml: 2 }}
            startIcon={<RefreshIcon />}
          >
            Rafraîchir
          </Button>
        </Typography>

        <NetworkStatus networkCheck={networkCheck} />
        <WalletStatus walletCheck={walletCheck} />
        <ContractStatus contractCheck={contractCheck} />
        
        {isAdmin && (
          <>
            <ContractPauseStatus />
            <AdminRights 
              rights={adminRights} 
              lastActivity={lastActivity}
            />
          </>
        )}
      </Stack>
    </Box>
  );
};
