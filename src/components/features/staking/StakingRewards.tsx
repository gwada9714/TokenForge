import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress,
  Divider,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon,
  Paid as PaidIcon,
  History as HistoryIcon
} from '@mui/icons-material';

interface StakingReward {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  amount: string;
  claimable: boolean;
  apy: number;
  lastClaimDate?: string;
}

interface StakingRewardsProps {
  rewards?: StakingReward[];
  isLoading?: boolean;
  onClaimReward?: (rewardId: string) => Promise<void>;
  onClaimAll?: () => Promise<void>;
}

export const StakingRewards: React.FC<StakingRewardsProps> = ({
  rewards = [],
  isLoading = false,
  onClaimReward,
  onClaimAll
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample rewards for demonstration
  const sampleRewards: StakingReward[] = [
    {
      id: '1',
      tokenName: 'TokenForge Coin',
      tokenSymbol: 'TFC',
      amount: '250.5',
      claimable: true,
      apy: 12.5,
      lastClaimDate: '2023-01-15'
    },
    {
      id: '2',
      tokenName: 'Staking Token',
      tokenSymbol: 'STK',
      amount: '75.25',
      claimable: true,
      apy: 8.75,
      lastClaimDate: '2023-02-20'
    },
    {
      id: '3',
      tokenName: 'Yield Token',
      tokenSymbol: 'YLD',
      amount: '120',
      claimable: false,
      apy: 15,
      lastClaimDate: '2023-03-10'
    }
  ];

  const displayRewards = rewards.length > 0 ? rewards : sampleRewards;
  const totalRewards = displayRewards.reduce((sum, reward) => {
    return sum + parseFloat(reward.amount);
  }, 0);
  const claimableRewards = displayRewards.filter(reward => reward.claimable);
  const totalClaimable = claimableRewards.reduce((sum, reward) => {
    return sum + parseFloat(reward.amount);
  }, 0);

  const handleClaimReward = async (rewardId: string) => {
    try {
      setClaimingId(rewardId);
      setError(null);
      
      if (onClaimReward) {
        await onClaimReward(rewardId);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim reward");
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimAll = async () => {
    try {
      setClaimingAll(true);
      setError(null);
      
      if (onClaimAll) {
        await onClaimAll();
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim all rewards");
    } finally {
      setClaimingAll(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Summary Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WalletIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Récompenses Totales</Typography>
                </Box>
                <Typography variant="h4">{totalRewards.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Valeur totale de toutes les récompenses
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaidIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Réclamable</Typography>
                </Box>
                <Typography variant="h4">{totalClaimable.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Montant disponible pour réclamation
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HistoryIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Historique</Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 1 }}
                >
                  Voir l&apos;historique
                </Button>
              </Grid>
            </Grid>
            
            {claimableRewards.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {claimableRewards.length} récompense(s) disponible(s) pour réclamation
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleClaimAll}
                    disabled={claimingAll || claimableRewards.length === 0}
                    startIcon={claimingAll ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {claimingAll ? 'Réclamation...' : 'Réclamer Tout'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Rewards List */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Détail des Récompenses
          </Typography>
          
          {displayRewards.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Aucune récompense disponible
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {displayRewards.map((reward) => (
                <Grid item xs={12} md={6} lg={4} key={reward.id}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">{reward.tokenName}</Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {reward.tokenSymbol}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Montant
                      </Typography>
                      <Typography variant="h5">
                        {reward.amount} {reward.tokenSymbol}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        APY
                      </Typography>
                      <Typography variant="body1" color="success.main">
                        {reward.apy}%
                      </Typography>
                    </Box>
                    
                    {reward.lastClaimDate && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Dernière réclamation
                        </Typography>
                        <Typography variant="body1">
                          {reward.lastClaimDate}
                        </Typography>
                      </Box>
                    )}
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      disabled={!reward.claimable || claimingId === reward.id}
                      onClick={() => handleClaimReward(reward.id)}
                      startIcon={claimingId === reward.id ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      {claimingId === reward.id ? 'Réclamation...' : 'Réclamer'}
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
        
        {/* Staking Calculator */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Calculateur de Staking
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Montant à staker"
                  fullWidth
                  defaultValue="1000"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">TKN</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Période de staking"
                  fullWidth
                  defaultValue="12"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">mois</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Récompenses estimées
                  </Typography>
                  <Typography variant="h5" color="primary.main">
                    120 TKN
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Basé sur un APY de 12% pour 12 mois
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
