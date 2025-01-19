import React from 'react';
import { Alert, Box, Container, Typography } from '@mui/material';
import { useNetwork } from '../hooks/useNetwork';
import { getContractAddress } from '../../utils/contracts';
import { NetworkNotSupported } from '../shared/NetworkNotSupported';
import { LaunchpadForm } from './LaunchpadForm';

export const LaunchpadPage: React.FC = () => {
  const { chain } = useNetwork();
  
  const launchpadAddress = chain ? 
    (chain.id === 11155111 ? import.meta.env.VITE_LAUNCHPAD_CONTRACT_SEPOLIA : 
     chain.id === 1 ? import.meta.env.VITE_LAUNCHPAD_CONTRACT_MAINNET :
     chain.id === 31337 ? import.meta.env.VITE_LAUNCHPAD_CONTRACT_LOCAL : null) 
    : null;
  
  if (!chain) {
    return (
      <Container>
        <Alert severity="warning">
          Please connect your wallet to continue
        </Alert>
      </Container>
    );
  }

  if (!launchpadAddress) {
    return (
      <Container>
        <NetworkNotSupported 
          message={`Launchpad is not available on ${chain.name}. Please switch to a supported network.`}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Launch Your Token
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Create a fair and transparent token launch with TokenForge Launchpad
        </Typography>
        <LaunchpadForm contractAddress={launchpadAddress} />
      </Box>
    </Container>
  );
};
