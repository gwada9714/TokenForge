import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from "@mui/material";
// import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useAuth } from "@/hooks/useAuth";

interface StakingPool {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  tokenLogo: string;
  apr: number;
  totalStaked: string;
  lockPeriod: number; // en jours
  minStake: string;
  maxStake: string;
  createdAt: Date;
  endsAt: Date | null;
  status: "active" | "completed" | "upcoming";
}

interface UserStake {
  amount: string;
  stakedAt: Date;
  unlocksAt: Date;
  rewards: string;
  claimed: string;
}

interface TokenStakingPoolProps {
  pool: StakingPool;
}

export const TokenStakingPool: React.FC<TokenStakingPoolProps> = ({ pool }) => {
  const { user } = useAuth();
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [userStake, setUserStake] = useState<UserStake | null>(null);
  const [userBalance, setUserBalance] = useState<string>("1000"); // Simulé
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Simuler le chargement des données de staking de l'utilisateur
  useEffect(() => {
    if (user && pool) {
      // Dans une implémentation réelle, ces données viendraient d'une API ou d'un contrat
      if (pool.status === "active") {
        const mockStake: UserStake = {
          amount: "250",
          stakedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // il y a 15 jours
          unlocksAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // dans 15 jours
          rewards: "12.5",
          claimed: "0",
        };
        setUserStake(mockStake);
      } else {
        setUserStake(null);
      }
    }
  }, [user, pool]);

  // Mettre à jour le temps restant
  useEffect(() => {
    if (!userStake) return;

    const interval = setInterval(() => {
      const now = new Date();
      const unlockTime = userStake.unlocksAt;

      if (now >= unlockTime) {
        setTimeRemaining("Déverrouillé");
        clearInterval(interval);
        return;
      }

      const diffMs = unlockTime.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${diffDays}j ${diffHours}h ${diffMinutes}m`);
    }, 60000); // Mettre à jour chaque minute

    // Exécuter immédiatement
    const now = new Date();
    const unlockTime = userStake.unlocksAt;

    if (now >= unlockTime) {
      setTimeRemaining("Déverrouillé");
    } else {
      const diffMs = unlockTime.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${diffDays}j ${diffHours}h ${diffMinutes}m`);
    }

    return () => clearInterval(interval);
  }, [userStake]);

  const handleStakeAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStakeAmount(event.target.value);
  };

  const handleMaxAmount = () => {
    setStakeAmount(userBalance);
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;

    setIsStaking(true);

    try {
      // Simuler une transaction de staking
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const amount = stakeAmount;
      const now = new Date();
      const unlocksAt = new Date(
        now.getTime() + pool.lockPeriod * 24 * 60 * 60 * 1000
      );

      // Si l'utilisateur a déjà un stake, ajouter au montant existant
      if (userStake) {
        const newAmount = (
          parseFloat(userStake.amount) + parseFloat(amount)
        ).toString();
        const newRewards = (
          parseFloat(userStake.rewards) +
          ((parseFloat(amount) * pool.apr) / 100) * (pool.lockPeriod / 365)
        ).toString();

        setUserStake({
          ...userStake,
          amount: newAmount,
          rewards: newRewards,
        });
      } else {
        // Créer un nouveau stake
        const rewards = (
          ((parseFloat(amount) * pool.apr) / 100) *
          (pool.lockPeriod / 365)
        ).toString();

        setUserStake({
          amount,
          stakedAt: now,
          unlocksAt,
          rewards,
          claimed: "0",
        });
      }

      // Mettre à jour le solde de l'utilisateur
      setUserBalance((parseFloat(userBalance) - parseFloat(amount)).toString());
      setStakeAmount("");
    } catch (error) {
      console.error("Staking error:", error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    if (!userStake) return;

    setIsClaiming(true);

    try {
      // Simuler une transaction de claim
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mettre à jour le solde de l'utilisateur
      setUserBalance(
        (parseFloat(userBalance) + parseFloat(userStake.rewards)).toString()
      );

      // Mettre à jour le stake de l'utilisateur
      setUserStake({
        ...userStake,
        claimed: (
          parseFloat(userStake.claimed) + parseFloat(userStake.rewards)
        ).toString(),
        rewards: "0",
      });
    } catch (error) {
      console.error("Claim error:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleWithdraw = async () => {
    if (!userStake) return;

    setIsWithdrawing(true);

    try {
      // Simuler une transaction de withdraw
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const now = new Date();
      const isLocked = now < userStake.unlocksAt;
      const penalty = isLocked ? 0.1 : 0; // 10% de pénalité si déverrouillage anticipé

      const amountToReturn = parseFloat(userStake.amount) * (1 - penalty);
      const rewardsToReturn = parseFloat(userStake.rewards);

      // Mettre à jour le solde de l'utilisateur
      setUserBalance(
        (parseFloat(userBalance) + amountToReturn + rewardsToReturn).toString()
      );

      // Réinitialiser le stake de l'utilisateur
      setUserStake(null);
    } catch (error) {
      console.error("Withdraw error:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "error";
      case "upcoming":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "completed":
        return "Terminé";
      case "upcoming":
        return "À venir";
      default:
        return status;
    }
  };

  const formatNumber = (value: string | number) => {
    return parseFloat(value.toString()).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const calculateRewards = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return "0";

    const rewards =
      ((parseFloat(amount) * pool.apr) / 100) * (pool.lockPeriod / 365);
    return rewards.toFixed(6);
  };

  const calculateAPR = () => {
    return `${pool.apr}%`;
  };

  const isPoolActive = pool.status === "active";
  const canWithdraw =
    userStake &&
    (new Date() >= userStake.unlocksAt || pool.status === "completed");
  const canClaim = userStake && parseFloat(userStake.rewards) > 0;

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src={pool.tokenLogo}
                alt={pool.tokenName}
                sx={{
                  width: 40,
                  height: 40,
                  mr: 2,
                  borderRadius: "50%",
                  background: "#f5f5f5",
                  p: 1,
                }}
                onError={(e: any) => {
                  e.target.src = "/assets/images/tokens/default.svg";
                }}
              />
              <Box>
                <Typography variant="h5">
                  {pool.tokenName} ({pool.tokenSymbol})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pool.tokenAddress.substring(0, 8)}...
                  {pool.tokenAddress.substring(pool.tokenAddress.length - 8)}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={getStatusLabel(pool.status)}
              color={getStatusColor(pool.status) as any}
              size="small"
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations du Pool
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    APR:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {calculateAPR()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Période de lock:
                  </Typography>
                  <Typography variant="body1">
                    {pool.lockPeriod} jours
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total staké:
                  </Typography>
                  <Typography variant="body1">
                    {formatNumber(pool.totalStaked)} {pool.tokenSymbol}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Stake minimum:
                  </Typography>
                  <Typography variant="body1">
                    {formatNumber(pool.minStake)} {pool.tokenSymbol}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Stake maximum:
                  </Typography>
                  <Typography variant="body1">
                    {formatNumber(pool.maxStake)} {pool.tokenSymbol}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date de fin:
                  </Typography>
                  <Typography variant="body1">
                    {pool.endsAt
                      ? pool.endsAt.toLocaleDateString()
                      : "Indéfinie"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {!user ? (
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  Connectez-vous pour staker
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Vous devez vous connecter pour participer à ce pool de
                  staking.
                </Typography>
                <Button variant="contained" color="primary" href="/login">
                  Se connecter
                </Button>
              </CardContent>
            </Card>
          ) : userStake ? (
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Votre Staking
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Montant staké:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatNumber(userStake.amount)} {pool.tokenSymbol}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Récompenses:
                    </Typography>
                    <Typography
                      variant="body1"
                      color="success.main"
                      fontWeight="bold"
                    >
                      {formatNumber(userStake.rewards)} {pool.tokenSymbol}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date de stake:
                    </Typography>
                    <Typography variant="body1">
                      {userStake.stakedAt.toLocaleDateString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Déverrouillage:
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AccessTimeIcon
                        fontSize="small"
                        sx={{ mr: 0.5, color: "text.secondary" }}
                      />
                      <Typography variant="body1">{timeRemaining}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {!canWithdraw && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Vos tokens sont verrouillés jusqu'au{" "}
                    {userStake.unlocksAt.toLocaleDateString()}. Un retrait
                    anticipé entraînera une pénalité de 10%.
                  </Alert>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleClaim}
                  disabled={isClaiming || !canClaim}
                  startIcon={isClaiming ? <CircularProgress size={20} /> : null}
                  sx={{ mr: 1 }}
                >
                  {isClaiming ? "Réclamation..." : "Réclamer les récompenses"}
                </Button>

                <Button
                  variant="contained"
                  color={canWithdraw ? "success" : "primary"}
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  startIcon={
                    isWithdrawing ? <CircularProgress size={20} /> : null
                  }
                >
                  {isWithdrawing ? "Retrait..." : "Retirer"}
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Staker vos tokens
                </Typography>

                {!isPoolActive ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Ce pool de staking n'est pas actif actuellement.
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">
                          Montant à staker
                        </Typography>
                        <Typography variant="body2">
                          Balance: {formatNumber(userBalance)}{" "}
                          {pool.tokenSymbol}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TextField
                          fullWidth
                          type="number"
                          value={stakeAmount}
                          onChange={handleStakeAmountChange}
                          placeholder="0.00"
                          InputProps={{
                            endAdornment: (
                              <Button
                                variant="text"
                                size="small"
                                onClick={handleMaxAmount}
                                sx={{ minWidth: "auto" }}
                              >
                                MAX
                              </Button>
                            ),
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Récompenses estimées:</strong>{" "}
                          {stakeAmount ? calculateRewards(stakeAmount) : "0"}{" "}
                          {pool.tokenSymbol}
                        </Typography>
                      </Alert>
                    </Box>
                  </>
                )}
              </CardContent>

              {isPoolActive && (
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleStake}
                    disabled={
                      !stakeAmount ||
                      parseFloat(stakeAmount) <= 0 ||
                      parseFloat(stakeAmount) > parseFloat(userBalance) ||
                      isStaking
                    }
                    startIcon={
                      isStaking ? <CircularProgress size={20} /> : null
                    }
                  >
                    {isStaking ? "Staking en cours..." : "Staker"}
                  </Button>
                </CardActions>
              )}
            </Card>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};
