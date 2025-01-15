import React from 'react';
import { Container, Text, Box } from '@chakra-ui/react';
import { StakingPool } from '../components/Staking/StakingPool';
import { CONTRACT_ADDRESSES } from '../config/contracts';

const StakingPage: React.FC = () => {
  const platformTokenAddress = CONTRACT_ADDRESSES.PLATFORM_TOKEN.sepolia;
  
  return (
    <Container maxW="container.xl" py={8}>
      <Text variant="h4" mb={6}>
        Staking
      </Text>

      <Box mb={8}>
        <Text variant="body1" mb={4}>
          Stake your TokenForge tokens to earn rewards and participate in platform governance.
        </Text>
      </Box>

      <StakingPool tokenAddress={platformTokenAddress} tokenSymbol="TFG" />
    </Container>
  );
};

export default StakingPage;
