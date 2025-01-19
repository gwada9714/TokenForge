import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CircularProgress, Box, Alert, Typography, Button, Stack } from '@mui/material';
import { SwapHoriz as SwapIcon } from '@mui/icons-material';
import { useWeb3 } from '../../contexts/Web3Context';
import { useWalletConnection } from '../../hooks/useWalletConnection';

export const CustomConnectButton: React.FC = () => {
  const { 
    isLoading,
    network: {
      isSupported,
      currentNetwork,
      isSwitching,
      switchToTestnet,
      switchToMainnet,
      isMainnet,
      isTestnet
    }
  } = useWeb3();

  const {
    hasError,
    errorMessage,
    retryCount,
    retry,
    resetError
  } = useWalletConnection();

  // Afficher un loader pendant la connexion ou le changement de réseau
  if (isLoading || isSwitching) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>
          {isSwitching ? 'Changement de réseau...' : 'Connexion en cours...'}
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
              onClick={() => {
                resetError();
                retry();
              }}
              disabled={retryCount >= 3}
              startIcon={<SwapIcon />}
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

  // Afficher un avertissement si le réseau n'est pas supporté
  if (!isSupported) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="warning">
          Réseau non supporté : {currentNetwork || 'Inconnu'}
        </Alert>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={switchToMainnet}
            disabled={isSwitching}
          >
            Passer sur Ethereum
          </Button>
          <Button
            variant="outlined"
            onClick={switchToTestnet}
            disabled={isSwitching}
          >
            Passer sur Sepolia
          </Button>
        </Stack>
        <ConnectButton />
      </Box>
    );
  }

  // Afficher le bouton de connexion avec option de changer de réseau
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ConnectButton />
      {(isMainnet || isTestnet) && (
        <Button
          size="small"
          startIcon={<SwapIcon />}
          onClick={isMainnet ? switchToTestnet : switchToMainnet}
          sx={{ mt: 1 }}
        >
          Passer sur {isMainnet ? 'Sepolia' : 'Ethereum'}
        </Button>
      )}
    </Box>
  );
};

export default CustomConnectButton;
