import React from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  Tooltip,
  Alert,
  Slider,
} from "@mui/material";
import { MaxLimits } from "../../../../../../types/tokenFeatures";
import InfoIcon from "@mui/icons-material/Info";
import BlockIcon from "@mui/icons-material/Block";

interface MaxLimitsConfigurationProps {
  maxLimits: MaxLimits;
  totalSupply: string;
  onChange: (config: MaxLimits) => void;
  disabled?: boolean;
}

const RECOMMENDED_MAX_WALLET = 2; // 2% du total supply
const RECOMMENDED_MAX_TX = 1; // 1% du total supply

export const MaxLimitsConfiguration: React.FC<MaxLimitsConfigurationProps> = ({
  maxLimits,
  totalSupply,
  onChange,
  disabled = false,
}) => {
  const handleChange = (
    type: "maxWallet" | "maxTransaction",
    field: "enabled" | "percentage",
    value: boolean | number
  ) => {
    const newConfig = { ...maxLimits };
    if (field === "enabled") {
      newConfig[type].enabled = value as boolean;
      if (value) {
        // Définir des valeurs par défaut recommandées
        newConfig[type].percentage =
          type === "maxWallet" ? RECOMMENDED_MAX_WALLET : RECOMMENDED_MAX_TX;
        newConfig[type].amount = calculateAmount(
          totalSupply,
          newConfig[type].percentage
        );
      }
    } else {
      newConfig[type].percentage = value as number;
      newConfig[type].amount = calculateAmount(totalSupply, value as number);
    }
    onChange(newConfig);
  };

  const calculateAmount = (supply: string, percentage: number): string => {
    return (
      (BigInt(supply) * BigInt(Math.floor(percentage * 100))) /
      BigInt(10000)
    ).toString();
  };

  const isMaxWalletTooHigh =
    maxLimits.maxWallet.enabled && maxLimits.maxWallet.percentage > 5;
  const isMaxTxTooHigh =
    maxLimits.maxTransaction.enabled && maxLimits.maxTransaction.percentage > 2;

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <BlockIcon color="primary" />
          <Typography variant="h6">Limites Maximum (Anti-Whale)</Typography>
          <Tooltip title="Les limites maximum aident à prévenir la manipulation du marché en limitant la quantité de tokens qu'un portefeuille peut détenir ou échanger">
            <InfoIcon color="info" fontSize="small" />
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          {/* Max Wallet Configuration */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="subtitle1">
                    Limite Maximum par Portefeuille
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maxLimits.maxWallet.enabled}
                        onChange={(e) =>
                          handleChange("maxWallet", "enabled", e.target.checked)
                        }
                        disabled={disabled}
                      />
                    }
                    label="Activer"
                  />
                </Box>

                {maxLimits.maxWallet.enabled && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Pourcentage du total supply (
                        {maxLimits.maxWallet.percentage}%)
                      </Typography>
                      <Slider
                        value={maxLimits.maxWallet.percentage}
                        onChange={(_, value) =>
                          handleChange(
                            "maxWallet",
                            "percentage",
                            value as number
                          )
                        }
                        min={0.1}
                        max={10}
                        step={0.1}
                        disabled={disabled}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}%`}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Montant maximum"
                        value={maxLimits.maxWallet.amount}
                        disabled
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              tokens
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Max Transaction Configuration */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="subtitle1">
                    Limite Maximum par Transaction
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maxLimits.maxTransaction.enabled}
                        onChange={(e) =>
                          handleChange(
                            "maxTransaction",
                            "enabled",
                            e.target.checked
                          )
                        }
                        disabled={disabled}
                      />
                    }
                    label="Activer"
                  />
                </Box>

                {maxLimits.maxTransaction.enabled && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Pourcentage du total supply (
                        {maxLimits.maxTransaction.percentage}%)
                      </Typography>
                      <Slider
                        value={maxLimits.maxTransaction.percentage}
                        onChange={(_, value) =>
                          handleChange(
                            "maxTransaction",
                            "percentage",
                            value as number
                          )
                        }
                        min={0.1}
                        max={5}
                        step={0.1}
                        disabled={disabled}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}%`}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Montant maximum"
                        value={maxLimits.maxTransaction.amount}
                        disabled
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              tokens
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Warnings et Recommandations */}
          <Grid item xs={12}>
            {isMaxWalletTooHigh && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Une limite de portefeuille supérieure à 5% pourrait ne pas être
                efficace contre les baleines.
              </Alert>
            )}

            {isMaxTxTooHigh && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Une limite de transaction supérieure à 2% pourrait permettre une
                manipulation significative du prix.
              </Alert>
            )}

            <Alert severity="info">
              Les limites recommandées sont de {RECOMMENDED_MAX_WALLET}% pour
              les portefeuilles et {RECOMMENDED_MAX_TX}% pour les transactions.
            </Alert>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
