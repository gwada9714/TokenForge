import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import { CreatePool } from '../components/Launchpad/CreatePool';
import { LaunchpadPool } from '../components/Launchpad/LaunchpadPool';
import { useContractRead, useNetwork } from 'wagmi';
import { getContractAddress } from '../config/contracts';
import { launchpadABI } from '../contracts/abis';

const LaunchpadPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { chain } = useNetwork();
  const chainId = chain?.id || 11155111; // Default to Sepolia

  // Get total number of pools
  const { data: poolCount } = useContractRead({
    address: getContractAddress('LAUNCHPAD', chainId) || undefined,
    abi: launchpadABI,
    functionName: 'getPoolCount',
    watch: true,
  });

  // Create array of pool IDs
  const poolIds = poolCount ? Array.from({ length: Number(poolCount) }, (_, i) => i) : [];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        TokenForge Launchpad
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Launch your token with TokenForge's secure and easy-to-use launchpad platform.
          Create your own pool or participate in existing ones.
        </Typography>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Active Pools" />
            <Tab label="Create Pool" />
          </Tabs>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          {tabIndex === 0 && (
            <Grid container spacing={3}>
              {poolIds.map((poolId) => (
                <Grid item xs={12} sm={6} md={4} key={poolId}>
                  <LaunchpadPool poolId={poolId} />
                </Grid>
              ))}
            </Grid>
          )}
          {tabIndex === 1 && <CreatePool />}
        </Box>
      </Box>
    </Container>
  );
};

export default LaunchpadPage;
