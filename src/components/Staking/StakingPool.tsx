import React, { useState } from 'react';
import { Card, Button, Input, Divider, Flex, Box, Text } from '@chakra-ui/react';
import { useStaking } from '../../hooks/useStaking';

interface StakingPoolProps {
  tokenAddress: string;
  tokenSymbol: string;
}

export const StakingPool: React.FC<StakingPoolProps> = ({ tokenAddress, tokenSymbol }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const {
    userStake,
    poolInfo,
    rewards,
    stake,
    withdraw,
    claimRewards,
    isStaking,
    isWithdrawing,
    isClaiming,
  } = useStaking(tokenAddress);

  const handleStake = () => {
    if (!stakeAmount) return;
    stake(stakeAmount);
    setStakeAmount('');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    withdraw(withdrawAmount);
    setWithdrawAmount('');
  };

  return (
    <Card p={6} maxW="xl" mx="auto" mt={8}>
      <Text variant="h5" mb={4}>
        {tokenSymbol} Staking Pool
      </Text>

      <Divider my={4} />

      <Box mb={6}>
        <Text variant="subtitle1" mb={2}>
          Pool Statistics
        </Text>
        <Flex justify="space-between" mb={2}>
          <Text>Total Staked:</Text>
          <Text>{poolInfo.totalStaked} {tokenSymbol}</Text>
        </Flex>
        <Flex justify="space-between" mb={2}>
          <Text>Reward Rate:</Text>
          <Text>{poolInfo.rewardRate} {tokenSymbol}/day</Text>
        </Flex>
      </Box>

      <Box mb={6}>
        <Text variant="subtitle1" mb={2}>
          Your Stake
        </Text>
        <Flex justify="space-between" mb={2}>
          <Text>Staked Amount:</Text>
          <Text>{userStake.amount} {tokenSymbol}</Text>
        </Flex>
        <Flex justify="space-between" mb={2}>
          <Text>Pending Rewards:</Text>
          <Text>{rewards} {tokenSymbol}</Text>
        </Flex>
      </Box>

      <Box mb={6}>
        <Text variant="subtitle1" mb={2}>
          Stake Tokens
        </Text>
        <Flex gap={2}>
          <Input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Amount to stake"
          />
          <Button
            colorScheme="blue"
            onClick={handleStake}
            isLoading={isStaking}
            loadingText="Staking"
          >
            Stake
          </Button>
        </Flex>
      </Box>

      <Box mb={6}>
        <Text variant="subtitle1" mb={2}>
          Withdraw Tokens
        </Text>
        <Flex gap={2}>
          <Input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount to withdraw"
          />
          <Button
            colorScheme="red"
            onClick={handleWithdraw}
            isLoading={isWithdrawing}
            loadingText="Withdrawing"
          >
            Withdraw
          </Button>
        </Flex>
      </Box>

      <Button
        colorScheme="green"
        onClick={claimRewards}
        isLoading={isClaiming}
        loadingText="Claiming"
        isDisabled={Number(rewards) === 0}
        w="full"
      >
        Claim Rewards
      </Button>
    </Card>
  );
};
