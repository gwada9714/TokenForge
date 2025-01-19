/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { StakingPool } from '../components/Staking/StakingPool';
import { getContractAddress } from '../config/contracts';
import { useAccount } from 'wagmi';
import { useNetwork } from '../hooks/useNetwork';

const StakingPage = () => {
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  
  const platformTokenAddress = chain?.id ? getContractAddress('PLATFORM_TOKEN', chain.id) : null;

  if (!isConnected) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Veuillez connecter votre wallet pour accéder au staking.
        </Alert>
      </Container>
    );
  }

  if (!chain) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Aucun réseau détecté. Veuillez vous connecter à un réseau compatible.
        </Alert>
      </Container>
    );
  }

  if (!platformTokenAddress) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Le staking n'est pas disponible sur ce réseau. Veuillez changer de réseau.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Staking
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Stake your TokenForge tokens to earn rewards and participate in platform governance.
        </Typography>
      </Box>

      <StakingPool tokenAddress={platformTokenAddress} tokenSymbol="TFG" />
    </Container>
  );
};

export default StakingPage;
