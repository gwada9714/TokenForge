import React from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  useTheme,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useTokenForgePremium } from "@/hooks/useTokenForgePremium";
import { PremiumServiceCard } from "./PremiumServiceCard";
import { ServiceSubscriptionModal } from "./ServiceSubscriptionModal";
import { formatEther } from "ethers";
import { useAccount } from "wagmi";

export const PremiumDashboard: React.FC = () => {
  const theme = useTheme();
  const { address } = useAccount();
  const {
    services,
    userSubscriptions,
    isLoading,
    subscribeToService,
    calculateServiceCost,
  } = useTokenForgePremium();

  const [selectedService, setSelectedService] = React.useState<string | null>(
    null
  );

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Services Premium TokenForge
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Accédez à des fonctionnalités avancées pour maximiser le potentiel de
        vos tokens.
      </Typography>

      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} key={service.id}>
            <PremiumServiceCard
              service={service}
              subscription={userSubscriptions[service.id]}
              onSubscribe={() => setSelectedService(service.id)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Statistiques d'utilisation */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Vos Services Actifs
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(userSubscriptions).map(
            ([serviceId, subscription]) => {
              if (!subscription.isActive) return null;
              const service = services.find((s) => s.id === serviceId);
              if (!service) return null;

              const daysRemaining = Math.ceil(
                (subscription.endTime - Date.now()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Grid item xs={12} sm={6} md={4} key={serviceId}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">
                        {service.name}
                      </Typography>
                      <Chip
                        label={`${daysRemaining} jours restants`}
                        color={daysRemaining > 30 ? "success" : "warning"}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(daysRemaining / 30) * 100}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              );
            }
          )}
        </Grid>
      </Paper>

      {/* Modal de souscription */}
      <ServiceSubscriptionModal
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={services.find((s) => s.id === selectedService)}
        onSubscribe={subscribeToService}
        calculateCost={calculateServiceCost}
      />
    </Box>
  );
};
