import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { ServiceTierService } from "@/services/serviceTierService";

interface ServiceTierProps {
  selectedTier: string;
  onTierSelect: (tierId: string) => void;
}

const ServiceTier: React.FC<ServiceTierProps> = ({
  selectedTier,
  onTierSelect,
}) => {
  const tiers = ServiceTierService.getTiers();

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Choisissez votre Niveau de Service
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {tiers.map((tier) => (
          <Grid item xs={12} md={6} key={tier.id}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                border: selectedTier === tier.id ? "2px solid" : "none",
                borderColor: "primary.main",
              }}
            >
              {tier.recommended && (
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

              <Typography variant="h6" component="h2">
                {tier.name}
              </Typography>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {tier.description}
              </Typography>

              <Typography variant="h4" component="p" sx={{ mb: 3 }}>
                {tier.price} ETH
              </Typography>

              <List sx={{ flexGrow: 1 }}>
                {tier.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemIcon>
                      {feature.included ? (
                        <Check color="primary" />
                      ) : (
                        <Close color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.name}
                      secondary={feature.description}
                    />
                  </ListItem>
                ))}
              </List>

              <Button
                variant={selectedTier === tier.id ? "contained" : "outlined"}
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => onTierSelect(tier.id)}
              >
                {selectedTier === tier.id ? "Sélectionné" : "Sélectionner"}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServiceTier;
