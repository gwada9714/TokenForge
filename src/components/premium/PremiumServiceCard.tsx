import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Check as CheckIcon,
  AccessTime as AccessTimeIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { formatEther } from "ethers";
import { type PremiumService, type ServiceSubscription } from "@/types/premium";

interface PremiumServiceCardProps {
  service: PremiumService;
  subscription?: ServiceSubscription;
  onSubscribe: () => void;
}

export const PremiumServiceCard: React.FC<PremiumServiceCardProps> = ({
  service,
  subscription,
  onSubscribe,
}) => {
  const theme = useTheme();
  const isActive = subscription?.isActive;
  const daysRemaining = subscription
    ? Math.ceil((subscription.endTime - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: isActive ? `2px solid ${theme.palette.primary.main}` : "none",
      }}
    >
      {/* Badge de statut */}
      {isActive && (
        <Chip
          label={`${daysRemaining} jours restants`}
          color={daysRemaining > 30 ? "success" : "warning"}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        />
      )}

      <Typography variant="h5" component="h2" gutterBottom>
        {service.name}
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        {service.description}
      </Typography>

      {/* Prix */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="p" color="primary">
          {formatEther(service.pricing.basePrice)} ETH
        </Typography>
        <Typography variant="caption" color="text.secondary">
          + {formatEther(service.pricing.monthlyFee)} ETH/mois
        </Typography>
      </Box>

      {/* Caractéristiques */}
      <List sx={{ mb: 3, flexGrow: 1 }}>
        {service.features.map((feature, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>

      {/* Informations supplémentaires */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", mb: 1 }}
        >
          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
          Activation immédiate
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
          Paiement en ETH
        </Typography>
      </Box>

      {/* Bouton d'action */}
      <Button
        variant={isActive ? "outlined" : "contained"}
        color="primary"
        fullWidth
        onClick={onSubscribe}
      >
        {isActive ? "Prolonger l'abonnement" : "Souscrire maintenant"}
      </Button>
    </Paper>
  );
};
