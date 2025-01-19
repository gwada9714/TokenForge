import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNetwork } from 'wagmi';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import { RefreshRounded as RefreshIcon } from '@mui/icons-material';

export const CustomConnectButton: React.FC = () => {
  const { chain } = useNetwork();
  const {
    isConnecting,
    isReconnecting,
    hasError,
    errorMessage,
    retryCount,
    retry
  } = useWalletConnection();

  // Afficher un loader pendant la connexion
  if (isConnecting || isReconnecting) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>
          {isReconnecting ? 'Reconnexion en cours...' : 'Connexion en cours...'}
        </Typography>
      </Box>
    );
  }

  // Afficher une erreur avec option de réessayer
  if (hasError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert 
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => retry()}
              disabled={retryCount >= 3}
              startIcon={<RefreshIcon />}
            >
              Réessayer
            </Button>
          }
        >
          {errorMessage || 'Erreur de connexion au wallet'}
        </Alert>
        <ConnectButton />
      </Box>
    );
  }

  // Afficher une alerte si le réseau n'est pas supporté
  if (chain && !chain.id.toString().match(/^(1|11155111)$/)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="warning">
          Veuillez vous connecter au réseau Ethereum ou Sepolia
        </Alert>
        <ConnectButton />
      </Box>
    );
  }

  return <ConnectButton />;
};

export default CustomConnectButton;
