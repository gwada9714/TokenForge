import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Slider,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
// import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
// import TimelineIcon from '@mui/icons-material/Timeline';
import { useAuth } from '@/hooks/useAuth';

interface StakingTier {
  id: number;
  name: string;
  minAmount: number;
  discountPercentage: number;
  color: string;
}

interface StakingStats {
  totalStaked: number;
  stakersCount: number;
  averageStakingPeriod: number;
  apr: number;
}

export const TKNStakingPanel: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [userStake, setUserStake] = useState<{
    amount: number;
    lockedUntil: Date;
    tier: number;
    rewards: number;
  } | null>(null);
  const [userBalance, setUserBalance] = useState<number>(1000); // Simulé
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: 2500000,
    stakersCount: 1250,
    averageStakingPeriod: 90,
    apr: 12
  });
  
  const stakingTiers: StakingTier[] = [
    {
      id: 1,
      name: 'Bronze',
      minAmount: 100,
      discountPercentage: 10,
      color: '#CD7F32'
    },
    {
      id: 2,
      name: 'Argent',
      minAmount: 500,
      discountPercentage: 25,
      color: '#C0C0C0'
    },
    {
      id: 3,
      name: 'Or',
      minAmount: 1000,
      discountPercentage: 50,
      color: '#FFD700'
    },
    {
      id: 4,
      name: 'Platine',
      minAmount: 5000,
      discountPercentage: 75,
      color: '#E5E4E2'
    },
    {
      id: 5,
      name: 'Diamant',
      minAmount: 10000,
      discountPercentage: 100,
      color: '#B9F2FF'
    }
  ];
  
  // Simuler le chargement des données de staking de l'utilisateur
  useEffect(() => {
    if (user) {
      // Dans une implémentation réelle, ces données viendraient d'une API ou d'un contrat
      const mockStake = {
        amount: 750,
        lockedUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 jours
        tier: 2, // Argent
        rewards: 25.5
      };
      setUserStake(mockStake);
    }
  }, [user]);
  
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };
  
  const handleDurationChange = (_: Event, value: number | number[]) => {
    setDuration(value as number);
  };
  
  const handleMaxAmount = () => {
    setAmount(userBalance.toString());
  };
  
  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsStaking(true);
    
    try {
      // Simuler une transaction de staking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const stakeAmount = parseFloat(amount);
      const tier = stakingTiers.reduce((highest, tier) => {
        return stakeAmount >= tier.minAmount && tier.id > highest ? tier.id : highest;
      }, 0);
      
      setUserStake({
        amount: stakeAmount,
        lockedUntil: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        tier,
        rewards: (stakeAmount * stakingStats.apr / 100) * (duration / 365)
      });
      
      setUserBalance(prev => prev - stakeAmount);
      setAmount('');
      
      // Mettre à jour les statistiques globales
      setStakingStats(prev => ({
        ...prev,
        totalStaked: prev.totalStaked + stakeAmount,
        stakersCount: prev.stakersCount + (userStake ? 0 : 1),
        averageStakingPeriod: (prev.averageStakingPeriod * prev.stakersCount + duration) / (prev.stakersCount + (userStake ? 0 : 1))
      }));
      
    } catch (error) {
      console.error('Staking error:', error);
    } finally {
      setIsStaking(false);
    }
  };
  
  const handleUnstake = async () => {
    if (!userStake) return;
    
    setIsStaking(true);
    
    try {
      // Simuler une transaction de unstaking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Vérifier si le staking est déverrouillé
      const isLocked = userStake.lockedUntil > new Date();
      const penalty = isLocked ? 0.1 : 0; // 10% de pénalité si déverrouillage anticipé
      
      const amountToReturn = userStake.amount * (1 - penalty) + userStake.rewards;
      setUserBalance(prev => prev + amountToReturn);
      
      // Mettre à jour les statistiques globales
      setStakingStats(prev => ({
        ...prev,
        totalStaked: Math.max(0, prev.totalStaked - userStake.amount),
        stakersCount: Math.max(0, prev.stakersCount - 1)
      }));
      
      setUserStake(null);
      
    } catch (error) {
      console.error('Unstaking error:', error);
    } finally {
      setIsStaking(false);
    }
  };
  
  const getCurrentTier = () => {
    if (!userStake) return null;
    return stakingTiers.find(tier => tier.id === userStake.tier);
  };
  
  const getTimeRemaining = () => {
    if (!userStake) return '';
    
    const now = new Date();
    const lockEnd = userStake.lockedUntil;
    
    if (now > lockEnd) {
      return 'Déverrouillé';
    }
    
    const diffMs = lockEnd.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${diffDays}j ${diffHours}h`;
  };
  
  const getNextTier = () => {
    if (!amount) return null;
    
    const stakeAmount = parseFloat(amount);
    let nextTier = null;
    
    for (let i = 0; i < stakingTiers.length; i++) {
      if (stakeAmount < stakingTiers[i].minAmount) {
        nextTier = stakingTiers[i];
        break;
      }
    }
    
    return nextTier;
  };
  
  // const getCurrentTierIndex = () => {
  //   if (!userStake) return -1;
  //   return stakingTiers.findIndex(tier => tier.id === userStake.tier);
  // };
  
  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const amountToNextTier = nextTier && amount ? nextTier.minAmount - parseFloat(amount) : null;
  
  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Statistiques de Staking */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Statistiques de Staking $TKN
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Staké
                    </Typography>
                    <Typography variant="h4">
                      {stakingStats.totalStaked.toLocaleString()} $TKN
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre de Stakers
                    </Typography>
                    <Typography variant="h4">
                      {stakingStats.stakersCount.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Période Moyenne
                    </Typography>
                    <Typography variant="h4">
                      {Math.round(stakingStats.averageStakingPeriod)} jours
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      APR
                    </Typography>
                    <Typography variant="h4">
                      {stakingStats.apr}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Paliers de Réduction */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Paliers de Réduction</Typography>
              <Tooltip title="Stakez des tokens $TKN pour obtenir des réductions sur les frais de la plateforme. Plus vous stakez, plus la réduction est importante.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              {stakingTiers.map((tier, index) => {
                const isCurrentTier = userStake && userStake.tier === tier.id;
                const progress = index / (stakingTiers.length - 1) * 100;
                
                return (
                  <Box key={tier.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            bgcolor: tier.color,
                            mr: 1
                          }} 
                        />
                        <Typography variant="subtitle1">
                          {tier.name}
                        </Typography>
                        {isCurrentTier && (
                          <Chip 
                            label="Votre niveau" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Typography variant="subtitle1">
                        {tier.discountPercentage}% de réduction
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: tier.color
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ ml: 2, minWidth: 80 }}>
                        {tier.minAmount.toLocaleString()} $TKN
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
        
        {/* Interface de Staking */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              {userStake ? 'Votre Staking' : 'Staker vos $TKN'}
            </Typography>
            
            {!user && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Connectez-vous pour staker vos tokens $TKN
              </Alert>
            )}
            
            {user && !userStake && (
              <Box component="form" noValidate>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">Montant à staker</Typography>
                    <Typography variant="body2">
                      Balance: {userBalance.toLocaleString()} $TKN
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      InputProps={{
                        endAdornment: (
                          <Button 
                            variant="text" 
                            size="small" 
                            onClick={handleMaxAmount}
                            sx={{ minWidth: 'auto' }}
                          >
                            MAX
                          </Button>
                        )
                      }}
                    />
                  </Box>
                  
                  {nextTier && amount && parseFloat(amount) > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {amountToNextTier && amountToNextTier > 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Stakez {amountToNextTier.toLocaleString()} $TKN de plus pour atteindre le niveau {nextTier.name}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="primary">
                          Vous atteindrez le niveau {nextTier.name} avec {nextTier.discountPercentage}% de réduction
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Durée de staking (jours)
                  </Typography>
                  <Slider
                    value={duration}
                    onChange={handleDurationChange}
                    min={30}
                    max={365}
                    step={30}
                    marks={[
                      { value: 30, label: '30j' },
                      { value: 90, label: '90j' },
                      { value: 180, label: '180j' },
                      { value: 365, label: '365j' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Récompenses estimées:</strong> {amount && duration ? 
                        ((parseFloat(amount) * stakingStats.apr / 100) * (duration / 365)).toFixed(2) : 
                        '0'} $TKN
                    </Typography>
                  </Alert>
                </Box>
                
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleStake}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > userBalance || isStaking}
                  startIcon={isStaking ? <CircularProgress size={20} /> : null}
                >
                  {isStaking ? 'Staking en cours...' : 'Staker'}
                </Button>
              </Box>
            )}
            
            {user && userStake && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Montant staké
                    </Typography>
                    <Typography variant="h6">
                      {userStake.amount.toLocaleString()} $TKN
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Niveau
                    </Typography>
                    <Typography variant="h6" sx={{ color: currentTier?.color }}>
                      {currentTier?.name} ({currentTier?.discountPercentage}%)
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Récompenses accumulées
                    </Typography>
                    <Typography variant="h6">
                      {userStake.rewards.toFixed(2)} $TKN
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Temps restant
                    </Typography>
                    <Typography variant="h6">
                      {getTimeRemaining()}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mb: 3 }}>
                  <Alert 
                    severity={new Date() > userStake.lockedUntil ? "success" : "info"}
                    sx={{ mb: 2 }}
                  >
                    {new Date() > userStake.lockedUntil ? 
                      "Votre période de staking est terminée. Vous pouvez retirer vos tokens et récompenses sans pénalité." : 
                      "Votre staking est verrouillé jusqu'à la fin de la période. Un retrait anticipé entraînera une pénalité de 10%."}
                  </Alert>
                </Box>
                
                <Button
                  fullWidth
                  variant="contained"
                  color={new Date() > userStake.lockedUntil ? "success" : "primary"}
                  size="large"
                  onClick={handleUnstake}
                  disabled={isStaking}
                  startIcon={isStaking ? <CircularProgress size={20} /> : null}
                >
                  {isStaking ? 'Traitement...' : 'Retirer les tokens et récompenses'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
