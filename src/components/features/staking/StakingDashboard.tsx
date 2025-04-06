import React, { useMemo } from "react";
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
} from "@mui/material";
import { formatValue } from "@/utils/web3Adapters";
import { useStakingManager } from "@/hooks/useStakingManager";
import { useAccount } from "wagmi";
import { useNetwork } from "@/hooks/useNetwork";
import { StakingState, SUPPORTED_CHAINS } from "@/types/common";
import TokenIcon from "@mui/icons-material/Token";
import TimelineIcon from "@mui/icons-material/Timeline";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InfoIcon from "@mui/icons-material/Info";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-hot-toast";

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
    action: "stake" | "unstake" | "claim";
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
            <TableCell>
              {new Date(entry.timestamp * 1000).toLocaleString()}
            </TableCell>
            <TableCell>
              {entry.action === "stake" && "Stake"}
              {entry.action === "unstake" && "Unstake"}
              {entry.action === "claim" && "Récompenses réclamées"}
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
  const data = rewardsHistory.map((entry) => ({
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
    stakedAmount,
    rewards,
    apr,
    totalStaked,
    stakingHistory,
    isLoading,
    stake,
    unstake,
    claimRewards,
    refreshBalances,
  } = useStakingManager();

  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const stakedBalance = Number(formatValue(stakedAmount));

  const [stakeAmount, setStakeAmount] = React.useState("");
  const [unstakeAmount, setUnstakeAmount] = React.useState("");
  const [isStaking, setIsStaking] = React.useState(false);
  const [isUnstaking, setIsUnstaking] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);

  const handleStake = async () => {
    try {
      if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
        toast.error("Veuillez entrer un montant valide");
        return;
      }

      if (!isConnected) {
        toast.error("Veuillez connecter votre wallet");
        return;
      }

      if (!chain || !(chain.id in SUPPORTED_CHAINS)) {
        toast.error("Veuillez vous connecter à un réseau supporté");
        return;
      }

      setIsStaking(true);
      const tx = await stake(parseFloat(stakeAmount));
      await tx.wait();
      toast.success("Staking effectué avec succès");
      setStakeAmount("");
      await refreshBalances();
    } catch (error) {
      console.error("Erreur de staking:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du staking"
      );
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    try {
      if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
        toast.error("Veuillez entrer un montant valide");
        return;
      }

      if (parseFloat(unstakeAmount) > stakedBalance) {
        toast.error("Montant supérieur à votre balance stakée");
        return;
      }

      if (!isConnected) {
        toast.error("Veuillez connecter votre wallet");
        return;
      }

      if (!chain || !(chain.id in SUPPORTED_CHAINS)) {
        toast.error("Veuillez vous connecter à un réseau supporté");
        return;
      }

      setIsUnstaking(true);
      const tx = await unstake(parseFloat(unstakeAmount));
      await tx.wait();
      toast.success("Unstaking effectué avec succès");
      setUnstakeAmount("");
      await refreshBalances();
    } catch (error) {
      console.error("Erreur d'unstaking:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'unstaking"
      );
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaim = async () => {
    try {
      if (rewards <= 0n) {
        toast.error("Aucune récompense à réclamer");
        return;
      }

      if (!isConnected) {
        toast.error("Veuillez connecter votre wallet");
        return;
      }

      if (!chain || !(chain.id in SUPPORTED_CHAINS)) {
        toast.error("Veuillez vous connecter à un réseau supporté");
        return;
      }

      setIsClaiming(true);
      const tx = await claimRewards();
      await tx.wait();
      toast.success("Récompenses réclamées avec succès");
      await refreshBalances();
    } catch (error) {
      console.error("Erreur de claim:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la réclamation"
      );
    } finally {
      setIsClaiming(false);
    }
  };

  const chartData = useMemo(() => {
    return stakingHistory.map((entry) => ({
      timestamp: new Date(entry.timestamp * 1000).toLocaleDateString(),
      amount: Number(formatValue(entry.amount)),
    }));
  }, [stakingHistory]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Staked Amount"
            value={`${formatValue(stakedAmount)} TKN`}
            icon={<TokenIcon color="primary" />}
            tooltip="Total amount of tokens you have staked"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Pending Rewards"
            value={`${formatValue(rewards)} TKN`}
            icon={<TimelineIcon color="primary" />}
            tooltip="Rewards available to claim"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Current APR"
            value={`${apr.toFixed(2)}%`}
            icon={<AccountBalanceIcon color="primary" />}
            tooltip="Annual Percentage Rate"
          />
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staking Actions
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Stake Amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleStake}
                    disabled={!stakeAmount}
                    sx={{ mt: 1 }}
                  >
                    Stake
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Unstake Amount"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleUnstake}
                    disabled={!unstakeAmount}
                    sx={{ mt: 1 }}
                  >
                    Unstake
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleClaim}
                    disabled={rewards <= 0n}
                    sx={{ mt: 4 }}
                  >
                    Claim Rewards
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staking History
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StakingDashboard;
