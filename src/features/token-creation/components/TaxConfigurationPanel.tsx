import React, { useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Stack,
  Grid,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTokenCreation } from "@/store/hooks";
import { updateTokenConfig } from "@/store/slices/tokenCreationSlice";
import { isAddress } from "@ethersproject/address";
import { TaxConfig } from "@/types/tokenFeatures";

interface TaxConfigurationPanelProps {
  value?: TaxConfig;
  onChange?: (config: TaxConfig) => void;
  maxAdditionalTaxRate: number;
}

export const TaxConfigurationPanel: React.FC<TaxConfigurationPanelProps> = ({
  value,
  onChange,
  maxAdditionalTaxRate,
}) => {
  const defaultConfig: TaxConfig = {
    enabled: false,
    baseTaxRate: 0.5, // 0.5% taxe de base
    additionalTaxRate: 0, // taxe additionnelle configurable
    creatorWallet: "",
    distribution: {
      treasury: 60, // 60% pour TokenForge
      development: 20, // 20% pour le développement
      buyback: 15, // 15% pour le rachat et burn
      staking: 5, // 5% pour les stakers
    },
  };

  const taxConfig = value || defaultConfig;

  const handleChange = useCallback(
    (field: string, value: any) => {
      if (!onChange) return;

      if (field.startsWith("distribution.")) {
        const distField = field.split(".")[1];
        onChange({
          ...taxConfig,
          distribution: {
            ...taxConfig.distribution,
            [distField]: value,
          },
        });
      } else {
        onChange({
          ...taxConfig,
          [field]: value,
        });
      }
    },
    [onChange, taxConfig]
  );

  const isDistributionValid =
    taxConfig.distribution.treasury +
      taxConfig.distribution.development +
      taxConfig.distribution.buyback +
      taxConfig.distribution.staking ===
    100;

  const renderTooltip = (text: string) => (
    <Tooltip title={text} arrow placement="top">
      <IconButton size="small" sx={{ ml: 1 }}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuration de la Taxe
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Une taxe de base de {taxConfig.baseTaxRate}% est appliquée à
              chaque transaction. Cette taxe est utilisée pour maintenir et
              développer la plateforme.
            </Alert>
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={taxConfig.enabled}
                  onChange={(e) => handleChange("enabled", e.target.checked)}
                />
              }
              label="Activer la taxe additionnelle"
            />
            {renderTooltip(
              `Configurez une taxe additionnelle jusqu'à ${maxAdditionalTaxRate}% qui vous sera reversée`
            )}
          </Box>

          {taxConfig.enabled && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Taxe Additionnelle (%)"
                    type="number"
                    value={taxConfig.additionalTaxRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value >= 0 && value <= maxAdditionalTaxRate) {
                        handleChange("additionalTaxRate", value);
                      }
                    }}
                    inputProps={{
                      min: 0,
                      max: maxAdditionalTaxRate,
                      step: 0.1,
                    }}
                    helperText={`Maximum ${maxAdditionalTaxRate}%`}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Adresse de Réception"
                    value={taxConfig.creatorWallet}
                    onChange={(e) =>
                      handleChange("creatorWallet", e.target.value)
                    }
                    error={
                      !!taxConfig.creatorWallet &&
                      !isAddress(taxConfig.creatorWallet)
                    }
                    helperText={
                      taxConfig.creatorWallet &&
                      !isAddress(taxConfig.creatorWallet)
                        ? "Adresse invalide"
                        : "Adresse qui recevra la taxe additionnelle"
                    }
                  />
                </Grid>
              </Grid>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Distribution de la Taxe de Base ({taxConfig.baseTaxRate}%)
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(taxConfig.distribution).map(
                    ([key, value]) => (
                      <Grid item xs={12} sm={6} md={3} key={key}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                          <CardContent>
                            <Typography
                              variant="subtitle2"
                              color="primary"
                              gutterBottom
                            >
                              {key === "treasury"
                                ? "TokenForge"
                                : key === "development"
                                ? "Développement"
                                : key === "buyback"
                                ? "Rachat & Burn"
                                : "Staking"}
                            </Typography>
                            <Typography variant="h4" component="div">
                              {value}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {key === "treasury"
                                ? "Maintenance et profits"
                                : key === "development"
                                ? "Nouvelles fonctionnalités"
                                : key === "buyback"
                                ? "Mécanisme déflationniste"
                                : "Récompenses staking"}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  )}
                </Grid>
              </Box>

              {!isDistributionValid && (
                <Alert severity="error">
                  La distribution totale doit être égale à 100%
                </Alert>
              )}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
