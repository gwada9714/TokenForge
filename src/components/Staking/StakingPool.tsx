import React from 'react';
import {
  Card,
  Button,
  TextField,
  Box,
  Stack,
  Typography
} from '@mui/material';
import { useStaking } from '../../hooks/useStaking';
import { Address } from 'viem';

interface StakingPoolProps {
  tokenAddress: Address;
  tokenSymbol: string;
}

export const StakingPool: React.FC<StakingPoolProps> = ({ tokenAddress, tokenSymbol }) => {
  const {
    stakedAmount,
    pendingRewards,
    stakingStats,
    stake,
    withdraw,
    claimRewards,
    isLoading,
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
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
    <Card sx={{ p: 6, maxWidth: 'xl', mx: 'auto', mt: 8 }}>
      <Typography variant="h5" mb={4}>
        {tokenSymbol} Staking Pool
      </Typography>

      <Box mb={6}>
        <Typography variant="subtitle1" mb={2}>
          Pool Statistics
        </Typography>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography>Total Staked:</Typography>
          <Typography>{stakingStats?.totalStaked ?? 0} {tokenSymbol}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography>APY:</Typography>
          <Typography>{stakingStats?.apy ?? 0}%</Typography>
        </Stack>
      </Box>

      <Box mb={6}>
        <Stack spacing={2}>
          <Typography component="div" variant="body1">
            Total Staked: {stakingStats?.totalStaked ?? '0'} {tokenSymbol}
          </Typography>
          <Typography component="div" variant="body1">
            Your Stake: {stakedAmount ?? '0'} {tokenSymbol}
          </Typography>
          <Typography component="div" variant="body1">
            Pending Rewards: {pendingRewards ?? '0'} {tokenSymbol}
          </Typography>
        </Stack>
      </Box>

      <Box mb={6}>
        <Typography variant="subtitle1" mb={2}>
          Stake Tokens
        </Typography>
        <Stack direction="row" gap={2}>
          <TextField
            type="number"
            value={stakeAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStakeAmount(e.target.value)}
            placeholder="Amount to stake"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleStake}
            disabled={isLoading}
          >
            {isLoading ? 'Staking' : 'Stake'}
          </Button>
        </Stack>
      </Box>

      <Box mb={6}>
        <Typography variant="subtitle1" mb={2}>
          Withdraw Tokens
        </Typography>
        <Stack direction="row" gap={2}>
          <TextField
            type="number"
            value={withdrawAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithdrawAmount(e.target.value)}
            placeholder="Amount to withdraw"
          />
          <Button
            variant="contained"
            color="error"
            onClick={handleWithdraw}
            disabled={isLoading}
          >
            {isLoading ? 'Withdrawing' : 'Withdraw'}
          </Button>
        </Stack>
      </Box>

      <Button
        variant="contained"
        color="success"
        onClick={claimRewards}
        disabled={isLoading || Number(pendingRewards) === 0}
        sx={{ width: '100%' }}
      >
        {isLoading ? 'Claiming' : 'Claim Rewards'}
      </Button>
    </Card>
  );
};
