import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Tooltip,
  Stack
} from '@mui/material';
import { formatEther } from 'viem';
import TokenIcon from '@mui/icons-material/Token';
import StarIcon from '@mui/icons-material/Star';

interface PlanSelectionProps {
  selectedPlan: 'basic' | 'premium';
  onPlanSelect: (plan: 'basic' | 'premium') => void;
  price: bigint;
  tknBalance: bigint;
  payWithTKN: boolean;
  onPaymentMethodChange: (payWithTKN: boolean) => void;
}

const PlanCard: React.FC<{
  title: string;
  price: string;
  features: string[];
  selected: boolean;
  isPremium?: boolean;
  onClick: () => void;
}> = ({ title, price, features, selected, isPremium, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      border: selected ? 2 : 1,
      borderColor: selected ? 'primary.main' : 'divider',
      position: 'relative',
      cursor: 'pointer'
    }}
    onClick={onClick}
  >
    {isPremium && (
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'warning.main'
        }}
      >
        <StarIcon />
      </Box>
    )}
    <CardContent>
      <Typography variant="h5" component="div" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" color="primary" gutterBottom>
        {price} TKN
      </Typography>
      <Box mt={2}>
        {features.map((feature, index) => (
          <Typography
            key={index}
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            • {feature}
          </Typography>
        ))}
      </Box>
    </CardContent>
  </Card>
);

const PlanSelection: React.FC<PlanSelectionProps> = ({
  selectedPlan,
  onPlanSelect,
  price,
  tknBalance,
  payWithTKN,
  onPaymentMethodChange
}) => {
  const basicFeatures = [
    'Création de token ERC20',
    'Fonctions de base (Mint, Burn)',
    'Support multi-chain',
    'Taxe de la forge incluse'
  ];

  const premiumFeatures = [
    ...basicFeatures,
    'Fonctionnalités avancées',
    'Priorité dans le support',
    'Accès aux futures fonctionnalités',
    'Badge Premium'
  ];

  const formattedPrice = formatEther(price);
  const hasEnoughTKN = tknBalance >= price;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choisissez votre Plan
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <PlanCard
            title="Forgeron"
            price={formattedPrice}
            features={basicFeatures}
            selected={selectedPlan === 'basic'}
            onClick={() => onPlanSelect('basic')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PlanCard
            title="Maître Forgeron"
            price={formattedPrice}
            features={premiumFeatures}
            selected={selectedPlan === 'premium'}
            isPremium
            onClick={() => onPlanSelect('premium')}
          />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <TokenIcon color={hasEnoughTKN ? 'primary' : 'error'} />
          <Typography>
            Balance TKN: {formatEther(tknBalance)} TKN
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={payWithTKN}
              onChange={(e) => onPaymentMethodChange(e.target.checked)}
            />
          }
          label={
            <Tooltip title="Payez en TKN pour obtenir une réduction de 20%">
              <Typography>
                Payer en TKN (-20%)
              </Typography>
            </Tooltip>
          }
        />

        {!hasEnoughTKN && payWithTKN && (
          <Typography color="error">
            Balance TKN insuffisante. Veuillez acheter plus de TKN ou choisir un autre mode de paiement.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default React.memo(PlanSelection);
