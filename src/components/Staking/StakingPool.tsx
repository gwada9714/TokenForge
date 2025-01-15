import React, { useState } from 'react';
import {
  Card,
  Button,
  TextField,
  Box,
  Stack,
  Typography
} from '@mui/material';
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
          <Typography>{poolInfo.totalStaked} {tokenSymbol}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography>Reward Rate:</Typography>
          <Typography>{poolInfo.rewardRate} {tokenSymbol}/day</Typography>
        </Stack>
      </Box>

      <Box mb={6}>
        <Typography variant="subtitle1" mb={2}>
          Your Stake
        </Typography>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography>Staked Amount:</Typography>
          <Typography>{userStake.amount} {tokenSymbol}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography>Pending Rewards:</Typography>
          <Typography>{rewards} {tokenSymbol}</Typography>
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
            disabled={isStaking}
          >
            {isStaking ? 'Staking' : 'Stake'}
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
            disabled={isWithdrawing}
          >
            {isWithdrawing ? 'Withdrawing' : 'Withdraw'}
          </Button>
        </Stack>
      </Box>

      <Button
        variant="contained"
        color="success"
        onClick={claimRewards}
        disabled={isClaiming || Number(rewards) === 0}
        sx={{ width: '100%' }}
      >
        {isClaiming ? 'Claiming' : 'Claim Rewards'}
      </Button>
    </Card>
  );
};
