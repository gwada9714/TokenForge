import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Text,
  Divider,
  Flex,
  Box,
  Progress,
  Badge,
} from '@chakra-ui/react';
import { useLaunchpad } from '../../hooks/useLaunchpad';

interface LaunchpadPoolProps {
  poolId: number;
}

export const LaunchpadPool: React.FC<LaunchpadPoolProps> = ({ poolId }) => {
  const [contributionAmount, setContributionAmount] = useState('');

  const {
    poolInfo,
    userContribution,
    contribute,
    finalizePool,
    cancelPool,
    claimTokens,
    claimRefund,
    isContributing,
    isFinalizing,
    isCancelling,
    isClaiming,
    isRefunding,
  } = useLaunchpad(poolId);

  if (!poolInfo) return null;

  const progress = (Number(poolInfo.totalRaised) / Number(poolInfo.hardCap)) * 100;
  const now = Date.now() / 1000;
  const isLive = now >= poolInfo.startTime && now <= poolInfo.endTime;
  const isEnded = now > poolInfo.endTime;
  const isSoftCapReached = Number(poolInfo.totalRaised) >= Number(poolInfo.softCap);

  const handleContribute = () => {
    if (!contributionAmount) return;
    contribute(contributionAmount);
    setContributionAmount('');
  };

  const getPoolStatus = () => {
    if (poolInfo.cancelled) return <Badge colorScheme="red">Cancelled</Badge>;
    if (poolInfo.finalized) return <Badge colorScheme="green">Finalized</Badge>;
    if (isEnded) return <Badge colorScheme="yellow">Ended</Badge>;
    if (isLive) return <Badge colorScheme="green">Live</Badge>;
    return <Badge colorScheme="blue">Upcoming</Badge>;
  };

  return (
    <Card p={6} maxW="xl" mx="auto" mt={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text variant="h5">Pool #{poolId}</Text>
        {getPoolStatus()}
      </Flex>

      <Divider my={4} />

      <Box mb={6}>
        <Text variant="subtitle1" mb={2}>
          Pool Information
        </Text>
        <Flex justify="space-between" mb={2}>
          <Text>Token Address:</Text>
          <Text>{poolInfo.token}</Text>
        </Flex>
        <Flex justify="space-between" mb={2}>
          <Text>Token Price:</Text>
          <Text>{poolInfo.tokenPrice} ETH</Text>
        </Flex>
        <Flex justify="space-between" mb={2}>
          <Text>Progress:</Text>
          <Text>
            {poolInfo.totalRaised} / {poolInfo.hardCap} ETH
          </Text>
        </Flex>
        <Progress value={progress} colorScheme="blue" mt={2} />
      </Box>

      <Box mb={6}>
        <Text variant="subtitle1" mb={2}>
          Your Contribution
        </Text>
        <Text>{userContribution} ETH</Text>
      </Box>

      {isLive && !poolInfo.finalized && !poolInfo.cancelled && (
        <Box mb={6}>
          <Text variant="subtitle1" mb={2}>
            Contribute
          </Text>
          <Flex gap={2}>
            <Input
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              placeholder="Amount in ETH"
            />
            <Button
              colorScheme="blue"
              onClick={handleContribute}
              isLoading={isContributing}
              loadingText="Contributing"
            >
              Contribute
            </Button>
          </Flex>
        </Box>
      )}

      {isEnded && !poolInfo.finalized && !poolInfo.cancelled && isSoftCapReached && (
        <Button
          colorScheme="green"
          onClick={finalizePool}
          isLoading={isFinalizing}
          loadingText="Finalizing"
          mb={4}
          w="full"
        >
          Finalize Pool
        </Button>
      )}

      {!poolInfo.finalized && !poolInfo.cancelled && (
        <Button
          colorScheme="red"
          onClick={cancelPool}
          isLoading={isCancelling}
          loadingText="Cancelling"
          mb={4}
          w="full"
        >
          Cancel Pool
        </Button>
      )}

      {poolInfo.finalized && Number(userContribution) > 0 && (
        <Button
          colorScheme="green"
          onClick={claimTokens}
          isLoading={isClaiming}
          loadingText="Claiming"
          mb={4}
          w="full"
        >
          Claim Tokens
        </Button>
      )}

      {(poolInfo.cancelled || (isEnded && !isSoftCapReached)) && Number(userContribution) > 0 && (
        <Button
          colorScheme="yellow"
          onClick={claimRefund}
          isLoading={isRefunding}
          loadingText="Claiming Refund"
          w="full"
        >
          Claim Refund
        </Button>
      )}
    </Card>
  );
};
