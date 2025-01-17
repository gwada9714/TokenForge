import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { useTokenForgePlans } from '../../hooks/useTokenForgePlans';
import { PlanType, DEFAULT_PLANS, type PlanDetails } from '../../types/plans';
import { toast } from 'react-hot-toast';
import { useAccount, useNetwork } from 'wagmi';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const PlanSelector: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { buyPlan, isLoading: isContractLoading } = useTokenForgePlans();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanSelection = async (planType: PlanType) => {
    console.log('Sélection du plan:', planType);
    
    if (!isConnected) {
      toast.error('Veuillez connecter votre wallet');
      return;
    }

    if (!address) {
      toast.error('Adresse wallet non trouvée');
      return;
    }

    if (!chain) {
      toast.error('Réseau non supporté');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const plan = DEFAULT_PLANS[planType];
      console.log('Plan sélectionné:', {
        plan,
        chainId: chain.id,
        userAddress: address
      });

      const tx = await buyPlan(planType);
      console.log('Transaction envoyée:', tx);
      
      toast.success('Transaction envoyée ! Attendez la confirmation...');
    } catch (error) {
      console.error('Erreur lors de la sélection du plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sélection du plan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || isContractLoading;

  // Créer un tableau des plans avec les types corrects
  const planEntries = Object.entries(DEFAULT_PLANS).map(([key, value]) => ({
    type: Number(key) as PlanType,
    plan: value
  }));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      <Typography variant="h3" align="center" sx={{ mb: 1 }}>
        Plans & Tarifs
      </Typography>
      
      <Typography variant="h6" align="center" sx={{ mb: 6, color: 'text.secondary' }}>
        Choisissez le plan qui correspond à vos besoins
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Connectez votre wallet pour choisir un plan
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        gap: 3,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {planEntries.map(({ type, plan }) => (
          <Card key={type} sx={{ 
            flex: '1 1 300px',
            maxWidth: 350,
            borderRadius: 2,
            bgcolor: '#fff',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
                {plan.name}
              </Typography>
              <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                {plan.bnbPrice} BNB
              </Typography>
              <Box sx={{ mb: 4 }}>
                {plan.features.map((feature: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>{feature}</Typography>
                  </Box>
                ))}
              </Box>
              <Button
                variant={type === PlanType.Forgeron ? "contained" : "outlined"}
                fullWidth
                onClick={() => handlePlanSelection(type)}
                disabled={loading || !isConnected}
                sx={type === PlanType.Forgeron ? {
                  bgcolor: '#ff9800',
                  '&:hover': {
                    bgcolor: '#f57c00'
                  }
                } : {}}
              >
                {loading ? <CircularProgress size={24} /> : 
                  type === PlanType.Apprenti ? 'Commencer' :
                  type === PlanType.MaitreForgeron ? 'Contacter' :
                  'Choisir'
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
