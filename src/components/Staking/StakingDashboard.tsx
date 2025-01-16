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
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { formatValue, parseValue, compareValues } from '@/utils/web3Adapters';
import { useStaking } from '@/hooks/useStaking';
import { TKN_TOKEN_ADDRESS, STAKING_CONFIG } from '@/constants/tokenforge';
import TokenIcon from '@mui/icons-material/Token';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoIcon from '@mui/icons-material/Info';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
  tooltip?: string;
}> = ({ title, value, icon, subValue, tooltip }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {icon}
        <Typography variant="h6">{title}</Typography>
        {tooltip && (
          <Tooltip title={tooltip}>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
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

const StakingHistory: React.FC<{
  history: Array<{
    timestamp: number;
    action: 'stake' | 'unstake' | 'claim';
    amount: bigint;
  }>;
}> = ({ history }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Action</TableCell>
          <TableCell align="right">Montant</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {history.map((entry, index) => (
          <TableRow key={index}>
            <TableCell>{new Date(entry.timestamp * 1000).toLocaleString()}</TableCell>
            <TableCell>
              {entry.action === 'stake' && 'Stake'}
              {entry.action === 'unstake' && 'Unstake'}
              {entry.action === 'claim' && 'Récompenses réclamées'}
            </TableCell>
            <TableCell align="right">{formatValue(entry.amount)} TKN</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const RewardsChart: React.FC<{
  rewardsHistory: Array<{
    timestamp: number;
    rewards: bigint;
  }>;
}> = ({ rewardsHistory }) => {
  const data = rewardsHistory.map(entry => ({
    date: new Date(entry.timestamp * 1000).toLocaleDateString(),
    rewards: Number(formatValue(entry.rewards)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <RechartsTooltip />
        <Line type="monotone" dataKey="rewards" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

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
    rewardsHistory,
    stakingHistory,
  } = useStaking(TKN_TOKEN_ADDRESS[1]);

  const formattedStats = useMemo(() => {
    if (!stakingStats) return null;
    return {
      totalStaked: formatValue(stakingStats.totalStaked),
      apy: (stakingStats.apy / 100).toFixed(2),
      stakersCount: stakingStats.stakersCount.toString(),
    };
  }, [stakingStats]);

  const handleStake = async () => {
    if (!stakeAmount) return;
    try {
      await toast.promise(stake(stakeAmount), {
        loading: 'Staking en cours...',
        success: 'Stake effectué avec succès !',
        error: 'Erreur lors du stake',
      });
      setStakeAmount('');
    } catch (error) {
      console.error('Stake error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    try {
      await toast.promise(withdraw(withdrawAmount), {
        loading: 'Retrait en cours...',
        success: 'Retrait effectué avec succès !',
        error: 'Erreur lors du retrait',
      });
      setWithdrawAmount('');
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };

  const handleClaimRewards = async () => {
    try {
      await toast.promise(claimRewards(), {
        loading: 'Réclamation des récompenses...',
        success: 'Récompenses réclamées avec succès !',
        error: 'Erreur lors de la réclamation',
      });
    } catch (error) {
      console.error('Claim error:', error);
    }
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
            tooltip="Montant total de TKN stakés sur la plateforme"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="APY"
            value={`${formattedStats?.apy || '0'}%`}
            icon={<TimelineIcon />}
            subValue="Rendement annuel estimé"
            tooltip="Taux de rendement annuel basé sur les récompenses actuelles"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Vos Récompenses"
            value={`${formatValue(pendingRewards || 0n)} TKN`}
            icon={<AccountBalanceIcon />}
            subValue="Récompenses non réclamées"
            tooltip="Récompenses accumulées que vous pouvez réclamer"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution de vos Récompenses
              </Typography>
              <RewardsChart rewardsHistory={rewardsHistory} />
            </CardContent>
          </Card>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStakeAmount(e.target.value)}
                  fullWidth
                  helperText={`Balance disponible: ${formatValue(balance || 0n)} TKN`}
                />
                <Button
                  variant="contained"
                  onClick={handleStake}
                  disabled={!stakeAmount || !balance || compareValues(parseValue(stakeAmount), balance)}
                  fullWidth
                >
                  Staker
                </Button>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Alert severity="info">
                Minimum de stake: {formatValue(STAKING_CONFIG.MINIMUM_AMOUNT)} TKN
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
                  Montant staké: {formatValue(stakedAmount || 0n)} TKN
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithdrawAmount(e.target.value)}
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

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historique des Opérations
              </Typography>
              <StakingHistory history={stakingHistory} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StakingDashboard;