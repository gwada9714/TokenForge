import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork } from 'wagmi';
import { Alert, Box, CircularProgress } from '@mui/material';

export const CustomConnectButton: React.FC = () => {
  const { isConnecting, isReconnecting } = useAccount();
  const { chain } = useNetwork();

  // Afficher un loader pendant la connexion
  if (isConnecting || isReconnecting) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <span>Connexion en cours...</span>
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
