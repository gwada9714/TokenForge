import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { StakingPool } from '../components/Staking/StakingPool';
import { CONTRACT_ADDRESSES } from '../config/contracts';

const StakingPage: React.FC = () => {
  const platformTokenAddress = CONTRACT_ADDRESSES.PLATFORM_TOKEN.sepolia || '';
  
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
