import React, { useState } from 'react';
import {
  Card,
  Button,
  TextField,
  Box,
  Stack,
  LinearProgress,
  Badge,
  Typography,
} from '@mui/material';
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
    if (poolInfo.cancelled) return <Badge color="error">Cancelled</Badge>;
    if (poolInfo.finalized) return <Badge color="success">Finalized</Badge>;
    if (isEnded) return <Badge color="warning">Ended</Badge>;
    if (isLive) return <Badge color="success">Live</Badge>;
    return <Badge color="info">Upcoming</Badge>;
  };

  return (
    <Card sx={{ p: 6, maxWidth: 'xl', mx: 'auto', mt: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5">Pool #{poolId}</Typography>
        {getPoolStatus()}
      </Stack>

      <Box mb={6}>
        <Typography variant="subtitle1" mb={2}>
          Pool Information
        </Typography>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Box>Token Address:</Box>
          <Box>{poolInfo.token}</Box>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Box>Token Price:</Box>
          <Box>{poolInfo.tokenPrice} ETH</Box>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Box>Progress:</Box>
          <Box>
            {poolInfo.totalRaised} / {poolInfo.hardCap} ETH
          </Box>
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
      </Box>

      <Box mb={6}>
        <Typography variant="subtitle1" mb={2}>
          Your Contribution
        </Typography>
        <Box>{userContribution} ETH</Box>
      </Box>

      {isLive && !poolInfo.finalized && !poolInfo.cancelled && (
        <Box mb={6}>
          <Typography variant="subtitle1" mb={2}>
            Contribute
          </Typography>
          <Stack direction="row" gap={2}>
            <TextField
              type="number"
              value={contributionAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContributionAmount(e.target.value)}
              placeholder="Amount in ETH"
            />
            <Button
              color="primary"
              onClick={handleContribute}
              disabled={isContributing}
            >
              {isContributing ? 'Contributing' : 'Contribute'}
            </Button>
          </Stack>
        </Box>
      )}

      {isEnded && !poolInfo.finalized && !poolInfo.cancelled && isSoftCapReached && (
        <Button
          color="success"
          onClick={finalizePool}
          disabled={isFinalizing}
          sx={{ mb: 4, width: '100%' }}
        >
          {isFinalizing ? 'Finalizing' : 'Finalize Pool'}
        </Button>
      )}

      {!poolInfo.finalized && !poolInfo.cancelled && (
        <Button
          color="error"
          onClick={cancelPool}
          disabled={isCancelling}
          sx={{ mb: 4, width: '100%' }}
        >
          {isCancelling ? 'Cancelling' : 'Cancel Pool'}
        </Button>
      )}

      {poolInfo.finalized && Number(userContribution) > 0 && (
        <Button
          color="success"
          onClick={claimTokens}
          disabled={isClaiming}
          sx={{ mb: 4, width: '100%' }}
        >
          {isClaiming ? 'Claiming' : 'Claim Tokens'}
        </Button>
      )}

      {(poolInfo.cancelled || (isEnded && !isSoftCapReached)) && Number(userContribution) > 0 && (
        <Button
          color="warning"
          onClick={claimRefund}
          disabled={isRefunding}
          sx={{ width: '100%' }}
        >
          {isRefunding ? 'Claiming Refund' : 'Claim Refund'}
        </Button>
      )}
    </Card>
  );
};
