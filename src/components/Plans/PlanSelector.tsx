import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useTokenApproval } from '../../hooks/useTokenApproval';
import { useTokenForgePlans } from '../../hooks/useTokenForgePlans';
import { BASIC_TIER_PRICE, PREMIUM_TIER_PRICE } from '../../constants/tokenforge';
import { formatEther, Address } from 'viem';
import { UserLevel } from '../../types/plans';

const FACTORY_ADDRESS = '0xB0B6ED3e12f9Bb24b1bBC3413E3bb374A6e8B2E5' as const;

export const PlanSelector: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<UserLevel>(UserLevel.BASIC);
  const planPrice = selectedPlan === UserLevel.BASIC ? BASIC_TIER_PRICE : PREMIUM_TIER_PRICE;
  
  const {
    approveTokens,
    allowance,
    balance,
    isApproving,
    refetchAllowance
  } = useTokenApproval(FACTORY_ADDRESS as Address);

  const { buyPlan } = useTokenForgePlans();

  const handleApprove = async () => {
    try {
      await approveTokens(formatEther(planPrice));
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleBuyPlan = async () => {
    try {
      await buyPlan(selectedPlan, 'TKN');
    } catch (error) {
      console.error('Erreur lors de l\'achat du plan:', error);
    }
  };

  const needsApproval = Number(allowance) < Number(formatEther(planPrice));
  const hasEnoughBalance = Number(balance) >= Number(formatEther(planPrice));

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Sélectionnez votre plan
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Card 
          sx={{ 
            flex: 1, 
            cursor: 'pointer',
            border: selectedPlan === UserLevel.BASIC ? '2px solid primary.main' : 'none'
          }}
          onClick={() => setSelectedPlan(UserLevel.BASIC)}
        >
          <CardContent>
            <Typography variant="h5">Basic</Typography>
            <Typography>100 TKN</Typography>
            <Typography variant="body2" color="text.secondary">
              • Création de token illimitée
              • Fonctionnalités standard
              • Support basique
            </Typography>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            flex: 1, 
            cursor: 'pointer',
            border: selectedPlan === UserLevel.PREMIUM ? '2px solid primary.main' : 'none'
          }}
          onClick={() => setSelectedPlan(UserLevel.PREMIUM)}
        >
          <CardContent>
            <Typography variant="h5">Premium</Typography>
            <Typography>1000 TKN</Typography>
            <Typography variant="body2" color="text.secondary">
              • Toutes les fonctionnalités
              • Support prioritaire
              • Personnalisation avancée
              • Accès anticipé aux nouvelles fonctionnalités
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography>
          Votre solde: {balance} TKN
        </Typography>
        <Typography>
          Montant approuvé: {allowance} TKN
        </Typography>
      </Box>

      {!hasEnoughBalance ? (
        <Typography color="error">
          Solde TKN insuffisant pour ce plan
        </Typography>
      ) : needsApproval ? (
        <Button
          variant="contained"
          onClick={handleApprove}
          disabled={isApproving}
          fullWidth
        >
          {isApproving ? (
            <CircularProgress size={24} />
          ) : (
            'Approuver les TKN'
          )}
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={handleBuyPlan}
          fullWidth
        >
          Acheter le plan
        </Button>
      )}
    </Box>
  );
};
