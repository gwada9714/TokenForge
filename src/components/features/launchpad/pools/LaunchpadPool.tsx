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
import { formatEther } from 'viem';

interface LaunchpadPoolProps {
  poolId: number;
}

export const LaunchpadPool: React.FC<LaunchpadPoolProps> = ({ poolId }) => {
  const [contributionAmount, setContributionAmount] = useState('');

  const {
    poolInfo,
    userContribution,
    invest,
    claim,
    isInvesting,
    isClaiming,
  } = useLaunchpad(poolId);

  if (!poolInfo) return null;

  const progress = (Number(formatEther(poolInfo.totalRaised)) / Number(formatEther(poolInfo.hardCap))) * 100;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const isLive = now >= poolInfo.startTime && now <= poolInfo.endTime;
  const isEnded = now > poolInfo.endTime;
  const isSoftCapReached = poolInfo.totalRaised >= poolInfo.softCap;

  const handleInvest = () => {
    if (!contributionAmount) return;
    invest?.({
      args: [BigInt(poolId)],
      value: BigInt(Math.floor(Number(contributionAmount) * 1e18)),
    });
    setContributionAmount('');
  };

  const handleClaim = () => {
    if (poolId === undefined) return;
    claim?.({ args: [BigInt(poolId)] });
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
          <Box>{formatEther(poolInfo.tokenPrice)} ETH</Box>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Box>Progress:</Box>
          <Box>
            {formatEther(poolInfo.totalRaised)} / {formatEther(poolInfo.hardCap)} ETH
          </Box>
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
      </Box>

      <Box mb={6}>
        <Typography variant="subtitle1" mb={2}>
          Your Contribution
        </Typography>
        <Box>{formatEther(userContribution)} ETH</Box>
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
              onClick={handleInvest}
              disabled={isInvesting}
            >
              {isInvesting ? 'Contributing' : 'Contribute'}
            </Button>
          </Stack>
        </Box>
      )}

      {poolInfo.finalized && Number(formatEther(userContribution)) > 0 && (
        <Button
          color="success"
          onClick={handleClaim}
          disabled={isClaiming}
          sx={{ mb: 4, width: '100%' }}
        >
          {isClaiming ? 'Claiming' : 'Claim Tokens'}
        </Button>
      )}
    </Card>
  );
};
