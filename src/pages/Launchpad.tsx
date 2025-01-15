import React, { useState } from 'react';
import {
  Container,
  Text,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
} from '@chakra-ui/react';
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
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'poolCount',
    watch: true,
  });

  // Create array of pool IDs
  const poolIds = poolCount ? Array.from({ length: Number(poolCount) }, (_, i) => i) : [];

  return (
    <Container maxW="container.xl" py={8}>
      <Text variant="h4" mb={6}>
        TokenForge Launchpad
      </Text>

      <Box mb={8}>
        <Text variant="body1" mb={4}>
          Launch your token with TokenForge's secure and easy-to-use launchpad platform.
          Create your own pool or participate in existing ones.
        </Text>
      </Box>

      <Tabs index={tabIndex} onChange={setTabIndex}>
        <TabList mb={4}>
          <Tab>Active Pools</Tab>
          <Tab>Create Pool</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {poolIds.map((poolId) => (
                <LaunchpadPool key={poolId} poolId={poolId} />
              ))}
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
            <CreatePool />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default LaunchpadPage;
