import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { SubscriptionTier } from "@/features/subscription/types";
import { useSubscription } from "@/features/subscription/hooks/useSubscription";

interface SubscriptionTierSelectorProps {
  selectedTier: SubscriptionTier | null;
  onSelect: (tier: SubscriptionTier) => void;
}

interface TierInfo {
  title: string;
  price: string;
  description: string;
  features: {
    name: string;
    included: boolean;
  }[];
  recommended?: boolean;
}

export const SubscriptionTierSelector: React.FC<
  SubscriptionTierSelectorProps
> = ({ selectedTier, onSelect }) => {
  const { currentSubscription } = useSubscription();

  const tiers: Record<SubscriptionTier, TierInfo> = {
    [SubscriptionTier.APPRENTI]: {
      title: "Apprenti Forgeron",
      price: "Gratuit",
      description: "Idéal pour débuter et tester vos idées",
      features: [
        { name: "Déploiement sur Testnet", included: true },
        { name: "Fonctionnalités de base", included: true },
        { name: "Déploiement sur Mainnet", included: false },
        { name: "Mint/Burn", included: false },
        { name: "Blacklist", included: false },
        { name: "Taxe personnalisée", included: false },
        { name: "Protection Anti-Whale", included: false },
        { name: "Support prioritaire", included: false },
      ],
    },
    [SubscriptionTier.FORGERON]: {
      title: "Forgeron",
      price: "0.2 BNB",
      description: "Pour les créateurs sérieux",
      features: [
        { name: "Déploiement sur Testnet", included: true },
        { name: "Fonctionnalités de base", included: true },
        { name: "Déploiement sur Mainnet", included: true },
        { name: "Mint/Burn", included: true },
        { name: "Blacklist", included: true },
        { name: "Taxe personnalisée (max 1.5%)", included: true },
        { name: "Protection Anti-Whale", included: false },
        { name: "Support prioritaire", included: false },
      ],
      recommended: true,
    },
    [SubscriptionTier.MAITRE]: {
      title: "Maître Forgeron",
      price: "0.5 BNB",
      description: "Fonctionnalités avancées pour les professionnels",
      features: [
        { name: "Déploiement sur Testnet", included: true },
        { name: "Fonctionnalités de base", included: true },
        { name: "Déploiement sur Mainnet", included: true },
        { name: "Mint/Burn", included: true },
        { name: "Blacklist", included: true },
        { name: "Taxe personnalisée (max 1.5%)", included: true },
        { name: "Protection Anti-Whale", included: true },
        { name: "Support prioritaire", included: true },
      ],
    },
  };

  const handleSelect = (tier: SubscriptionTier) => {
    onSelect(tier);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={4}>
        {Object.entries(tiers).map(([tierKey, tierInfo]) => {
          const tier = tierKey as SubscriptionTier;
          const isSelected = selectedTier === tier;
          const isCurrentSubscription = currentSubscription?.tier === tier;

          return (
            <Grid item xs={12} md={4} key={tier}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: isSelected ? "2px solid" : "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  position: "relative",
                  boxShadow: tierInfo.recommended ? 3 : 1,
                }}
              >
                {tierInfo.recommended && (
                  <Chip
                    label="Recommandé"
                    color="primary"
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: 20,
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {tierInfo.title}
                  </Typography>

                  <Typography variant="h4" color="primary" gutterBottom>
                    {tierInfo.price}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {tierInfo.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    {tierInfo.features.map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {feature.included ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CloseIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={feature.name} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions>
                  <Button
                    fullWidth
                    variant={isSelected ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => handleSelect(tier)}
                    disabled={isCurrentSubscription}
                  >
                    {isCurrentSubscription
                      ? "Abonnement actuel"
                      : isSelected
                      ? "Sélectionné"
                      : "Sélectionner"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
