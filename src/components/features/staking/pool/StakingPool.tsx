import React from 'react';
import {
  Card,
  Button,
  TextField,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { useStaking } from '../hooks/useStaking';
import { formatEther } from 'ethers';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';

interface StakingPoolProps {
  tokenAddress: Address;
  tokenSymbol: string;
}

export const StakingPool: React.FC<StakingPoolProps> = ({ tokenAddress, tokenSymbol }) => {
  const { isConnected } = useAccount();

  // Vérifier si l'adresse du token est valide
  if (tokenAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <Card sx={{ p: 6, maxWidth: 'xl', mx: 'auto', mt: 8 }}>
        <Alert severity="error">
          L'adresse du contrat de staking n'est pas configurée correctement.
        </Alert>
      </Card>
    );
  }

  // Vérifier si le wallet est connecté
  if (!isConnected) {
    return (
      <Card sx={{ p: 6, maxWidth: 'xl', mx: 'auto', mt: 8 }}>
        <Alert severity="info">
          Veuillez connecter votre wallet pour accéder au staking.
        </Alert>
      </Card>
    );
  }

  const {
    stakedAmount,
    pendingRewards,
    stakingStats,
    stake,
    withdraw,
    claimRewards,
    isLoading,
    error,
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
  } = useStaking(tokenAddress);

  const handleStake = () => {
    if (!stakeAmount) return;
    stake(stakeAmount);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    withdraw(withdrawAmount);
  };

  // Afficher un loader pendant le chargement initial des données
  if (isLoading && !stakedAmount && !stakingStats) {
    return (
      <Card sx={{ p: 6, maxWidth: 'xl', mx: 'auto', mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Card>
    );
  }

  // Afficher les erreurs s'il y en a
  if (error) {
    return (
      <Card sx={{ p: 6, maxWidth: 'xl', mx: 'auto', mt: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 6, maxWidth: 'xl', mx: 'auto', mt: 8 }}>
      <Typography variant="h5" mb={4}>
        {tokenSymbol} Staking Pool
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Vos Stats
        </Typography>
        <Stack spacing={2}>
          <Typography>
            Montant staké: {stakedAmount ? formatEther(stakedAmount) : '0'} {tokenSymbol}
          </Typography>
          <Typography>
            Récompenses en attente: {pendingRewards ? formatEther(pendingRewards) : '0'} {tokenSymbol}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Stats Globales
        </Typography>
        <Stack spacing={2}>
          <Typography>
            Total staké: {stakingStats ? formatEther(stakingStats.totalStaked) : '0'} {tokenSymbol}
          </Typography>
          <Typography>
            APY: {stakingStats ? stakingStats.apy : '0'}%
          </Typography>
          <Typography>
            Nombre de stakers: {stakingStats ? stakingStats.stakersCount : '0'}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Staker des tokens
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="number"
              label={`Montant à staker (${tokenSymbol})`}
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              disabled={isLoading}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleStake}
              disabled={isLoading || !stakeAmount}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Staker'}
            </Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Retirer des tokens
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="number"
              label={`Montant à retirer (${tokenSymbol})`}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isLoading}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleWithdraw}
              disabled={isLoading || !withdrawAmount}
              color="secondary"
            >
              {isLoading ? <CircularProgress size={24} /> : 'Retirer'}
            </Button>
          </Stack>
        </Box>

        <Box>
          <Button
            variant="contained"
            onClick={claimRewards}
            disabled={isLoading || !pendingRewards || pendingRewards === BigInt(0)}
            color="success"
            fullWidth
          >
            {isLoading ? <CircularProgress size={24} /> : 'Réclamer les récompenses'}
          </Button>
        </Box>
      </Stack>
    </Card>
  );
};
