import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Box,
  Chip
} from '@mui/material';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { SubscriptionTier } from '@/features/subscription/types';

interface TierCardProps {
  tier: SubscriptionTier;
  title: string;
  price: string;
  features: string[];
  onSelect: (tier: SubscriptionTier) => void;
  isSelected: boolean;
}

const TierCard: React.FC<TierCardProps> = ({
  tier,
  title,
  price,
  features,
  onSelect,
  isSelected
}) => (
  <Card 
    variant="outlined"
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderColor: isSelected ? 'primary.main' : 'inherit'
    }}
  >
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="div" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" color="primary" gutterBottom>
        {price} BNB
      </Typography>
      <Box sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <Typography
            key={index}
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            • {feature}
          </Typography>
        ))}
      </Box>
    </CardContent>
    <CardActions>
      <Button
        fullWidth
        variant={isSelected ? "contained" : "outlined"}
        onClick={() => onSelect(tier)}
      >
        {isSelected ? 'Sélectionné' : 'Choisir'}
      </Button>
    </CardActions>
  </Card>
);

export const SubscriptionTierSelector: React.FC = () => {
  const { subscribe } = useSubscription();
  const [selectedTier, setSelectedTier] = React.useState<SubscriptionTier | null>(null);

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  const tiers = [
    {
      tier: SubscriptionTier.APPRENTI,
      title: 'Apprenti Forgeron',
      price: '0',
      features: [
        'Création de token sur Testnet uniquement',
        'Fonctionnalités limitées',
        'Parfait pour tester et apprendre'
      ]
    },
    {
      tier: SubscriptionTier.FORGERON,
      title: 'Forgeron',
      price: '0.2',
      features: [
        'Création sur Mainnet',
        'Mint et Burn',
        'Blacklist',
        'Taxe de la forge 0.5%',
        'Support standard'
      ]
    },
    {
      tier: SubscriptionTier.MAITRE,
      title: 'Maître Forgeron',
      price: '0.5',
      features: [
        'Tous les avantages Forgeron',
        'Priorité nouvelles blockchains',
        'Support prioritaire',
        'Accès anticipé nouveautés'
      ]
    }
  ];

  return (
    <Grid container spacing={3}>
      {tiers.map((tier) => (
        <Grid item xs={12} md={4} key={tier.tier}>
          <TierCard
            {...tier}
            onSelect={handleTierSelect}
            isSelected={selectedTier === tier.tier}
          />
        </Grid>
      ))}
    </Grid>
  );
};
