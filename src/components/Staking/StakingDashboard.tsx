import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  TextField,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { formatEther, parseEther } from 'viem';
import { useStaking } from '@/hooks/useStaking';
import { STAKING_CONFIG } from '@/constants/tokenforge';
import TokenIcon from '@mui/icons-material/Token';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
}> = ({ title, value, icon, subValue }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="h4">{value}</Typography>
      {subValue && (
        <Typography variant="body2" color="text.secondary">
          {subValue}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const StakingDashboard: React.FC = () => {
  const {
    balance,
    stakedAmount,
    pendingRewards,
    stakingStats,
    isLoading,
    stake,
    withdraw,
    claimRewards,
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
    canUnstake,
    timeUntilUnstake,
  } = useStaking(STAKING_CONFIG.MINIMUM_AMOUNT);

  const formattedStats = useMemo(() => {
    if (!stakingStats) return null;
    const totalStakedHex = `0x${stakingStats.totalStaked.toString(16)}`;
    return {
      totalStaked: formatEther(totalStakedHex as `0x${string}`),
      apy: (stakingStats.apy / 100).toFixed(2),
      stakersCount: stakingStats.stakersCount.toString(),
    };
  }, [stakingStats]);

  const handleStake = async () => {
    if (!stakeAmount) return;
    const amount = BigInt(parseFloat(stakeAmount) * Math.pow(10, 18));
    await stake(amount);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    const amount = BigInt(parseFloat(withdrawAmount) * Math.pow(10, 18));
    await withdraw(amount);
  };

  const handleClaimRewards = async () => {
    await claimRewards();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Staking TKN
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Staké"
            value={`${formattedStats?.totalStaked || '0'} TKN`}
            icon={<TokenIcon />}
            subValue={`${formattedStats?.stakersCount || '0'} stakers actifs`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="APY"
            value={`${formattedStats?.apy || '0'}%`}
            icon={<TimelineIcon />}
            subValue="Rendement annuel estimé"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Vos Récompenses"
            value={`${formatEther(pendingRewards || 0n)} TKN`}
            icon={<AccountBalanceIcon />}
            subValue="Récompenses non réclamées"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staker vos TKN
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Montant à staker"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  fullWidth
                  helperText={`Balance disponible: ${formatEther(balance || 0n)} TKN`}
                />
                <Button
                  variant="contained"
                  onClick={handleStake}
                  disabled={!stakeAmount || parseEther(stakeAmount) > (balance || 0n)}
                  fullWidth
                >
                  Staker
                </Button>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Alert severity="info">
                Minimum de stake: {formatEther(STAKING_CONFIG.MINIMUM_AMOUNT)} TKN
                <br />
                Période de lock: {STAKING_CONFIG.LOCK_PERIOD / (24 * 3600)} jours
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vos Stakes
              </Typography>
              <Stack spacing={2}>
                <Typography>
                  Montant staké: {formatEther(stakedAmount || 0n)} TKN
                </Typography>
                {timeUntilUnstake > 0 && (
                  <Alert severity="warning">
                    Temps restant avant unstake: {Math.ceil(timeUntilUnstake / (24 * 3600))} jours
                  </Alert>
                )}
                <TextField
                  label="Montant à retirer"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={handleWithdraw}
                  disabled={!canUnstake || !(stakedAmount > 0n)}
                  fullWidth
                >
                  Retirer
                </Button>
                <Button
                  variant="contained"
                  onClick={handleClaimRewards}
                  disabled={!(pendingRewards > 0n)}
                  fullWidth
                >
                  Réclamer les Récompenses
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StakingDashboard;
