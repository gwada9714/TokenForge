import React, { memo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { NetworkStatus } from './NetworkStatus';
import { WalletStatus } from './WalletStatus';
import { ContractStatus } from './ContractStatus';

export const AdminCheck: React.FC<{ children?: React.ReactNode }> = memo(({ children }) => {
  const {
    isAdmin,
    error,
    isLoading,
    networkCheck,
    walletCheck,
    contractCheck,
    handleRetryCheck
  } = useTokenForgeAdmin();

  // État de chargement avec délai minimal pour éviter le flash
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
        <CircularProgress size={30} />
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
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetryCheck}
              startIcon={<RefreshIcon />}
            >
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>État des vérifications :</Typography>
          <Stack spacing={1}>
            <NetworkStatus networkCheck={{
              isCorrectNetwork: networkCheck?.isCorrectNetwork || false,
              requiredNetwork: networkCheck?.requiredNetwork || '',
              networkName: networkCheck?.networkName
            }} />
            <WalletStatus walletCheck={{
              isConnected: walletCheck?.isConnected || false,
              currentAddress: walletCheck?.currentAddress
            }} />
            <ContractStatus contractCheck={{
              isValid: contractCheck?.isValid || false,
              isDeployed: contractCheck?.isDeployed || false,
              error: contractCheck?.error
            }} />
          </Stack>
        </Box>
      </Box>
    );
  }

  // Si tout est OK et qu'il y a des enfants, les afficher
  if (children && isAdmin) {
    return <>{children}</>;
  }

  // Sinon, ne rien afficher
  return null;
});
