import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTokenForgePlans } from '../../hooks/useTokenForgePlans';
import { PlanType, DEFAULT_PLANS, PLAN_PRICES, formatPlanPrice } from '../../types/plans';
import { getContractAddress } from '../../config/contracts';
import { toast } from 'react-hot-toast';
import { useAccount, useNetwork } from 'wagmi';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const PlanSelector: React.FC = () => {
  useEffect(() => {
    console.log('PlanSelector monté !');
  }, []);

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { buyPlan, isLoading: planLoading, userPlan } = useTokenForgePlans();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Log l'état de la connexion à chaque changement
  useEffect(() => {
    console.log('État de la connexion:', {
      isConnected,
      address,
      chainId: chain?.id,
      chainName: chain?.name,
      userPlan,
      planLoading
    });
  }, [isConnected, address, chain, userPlan, planLoading]);

  const handlePlanClick = async (planType: PlanType) => {
    try {
      console.log('Clic sur le plan:', {
        planType,
        isConnected,
        address,
        chain: chain?.id
      });

      if (planType === PlanType.MaitreForgeron) {
        window.location.href = '/contact';
        return;
      }

      if (!isConnected) {
        toast.error('Veuillez connecter votre wallet pour choisir un plan');
        return;
      }

      if (!chain) {
        toast.error('Réseau non détecté');
        return;
      }

      const supportedNetworks = {
        11155111: 'Sepolia Testnet',
        1: 'Ethereum Mainnet'
      };

      if (!(chain.id in supportedNetworks)) {
        toast.error(`Réseau non supporté. Veuillez vous connecter à ${supportedNetworks[chain.id === 1 ? 1 : 11155111]}`);
        return;
      }

      if (userPlan === planType) {
        toast.error('Vous avez déjà ce plan');
        return;
      }

      setSelectedPlan(planType);
      setIsConfirmOpen(true);
    } catch (err) {
      console.error('Erreur lors du clic sur le plan:', err);
      toast.error('Une erreur est survenue');
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;
    
    try {
      setIsProcessing(true);
      console.log('Début achat plan:', {
        selectedPlan,
        address,
        chainId: chain?.id
      });

      const tx = await buyPlan(selectedPlan);
      console.log('Transaction envoyée:', tx);
      
      toast.success('Transaction envoyée !');
      setIsConfirmOpen(false);
    } catch (err) {
      console.error('Erreur achat plan:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'achat';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const isButtonDisabled = (planType: PlanType) => {
    if (!address) return false; // Permettre le clic pour connecter le wallet
    if (isProcessing) return true;
    if (userPlan === null) return false; // Pas de plan actuel, autoriser l'achat
    return userPlan === planType; // Désactiver si c'est le plan actuel
  };

  const getButtonText = (planType: PlanType) => {
    if (!address) return "Connecter le wallet";
    if (userPlan === planType) return "Plan actuel";
    if (planType === PlanType.Apprenti) return "Commencer";
    if (planType === PlanType.MaitreForgeron) return "Contacter";
    return "Choisir";
  };

  // Afficher les plans disponibles
  const planEntries = Object.entries(DEFAULT_PLANS).map(([key, value]) => ({
    type: Number(key) as PlanType,
    plan: value,
    pricing: PLAN_PRICES[Number(key) as PlanType]
  }));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      {/* Pour tester si le composant est bien rendu */}
      <div onClick={() => console.log('Test clic sur le conteneur')} style={{ cursor: 'pointer' }}>
        <Typography variant="h3" align="center" sx={{ mb: 1 }}>
          Plans & Tarifs
        </Typography>
      </div>
      
      <Typography variant="h6" align="center" sx={{ mb: 6, color: 'text.secondary' }}>
        Choisissez le plan qui correspond à vos besoins
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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
        {planEntries.map(({ type, plan, pricing }) => {
          const disabled = isButtonDisabled(type);
          console.log('Rendu du bouton:', { type, plan: plan.name, disabled });
          return (
            <Card key={type} sx={{ 
              flex: '1 1 300px',
              maxWidth: 350,
              borderRadius: 2,
              bgcolor: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: '0 0 15px rgba(0,0,0,0.2)'
              }
            }}
            onClick={() => {
              console.log('Card clicked:', type);
            }}>
              {userPlan === type && (
                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <CheckCircleIcon sx={{ mr: 0.5 }} />
                  <Typography variant="subtitle2">Plan actuel</Typography>
                </Box>
              )}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {plan.name}
                </Typography>
                <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                  {formatPlanPrice(type)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Button clicked:', type);
                    if (!address) {
                      // Connecter le wallet
                    } else {
                      handlePlanClick(type);
                    }
                  }}
                  onMouseDown={(e) => {
                    console.log('Button mouse down:', type);
                  }}
                  onMouseUp={(e) => {
                    console.log('Button mouse up:', type);
                  }}
                  disabled={disabled}
                  sx={{
                    ...type === PlanType.Forgeron ? {
                      bgcolor: '#ff9800',
                      '&:hover': {
                        bgcolor: '#f57c00'
                      }
                    } : {},
                    position: 'relative',
                    minHeight: '48px',
                    '&:active': {
                      transform: 'scale(0.98)'
                    }
                  }}
                >
                  {isProcessing && selectedPlan === type ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Transaction en cours...
                    </Box>
                  ) : getButtonText(type)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Dialog
        open={isConfirmOpen}
        onClose={() => !isProcessing && setIsConfirmOpen(false)}
      >
        <DialogTitle>Confirmer l'achat</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography>
              Êtes-vous sûr de vouloir acheter le plan {selectedPlan !== null && DEFAULT_PLANS[selectedPlan].name} pour {selectedPlan !== null && formatPlanPrice(selectedPlan)}?
            </Typography>
          </Box>
          <Typography color="text.secondary">
            * Des frais de gas s'appliqueront en plus du prix du plan
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsConfirmOpen(false)} 
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmPurchase} 
            disabled={isProcessing} 
            variant="contained" 
            color="primary"
          >
            {isProcessing ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Confirmation...
              </Box>
            ) : (
              'Confirmer'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
