import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Slider,
  Alert,
  Grid,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Paper,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { useSubscription } from "@/features/subscription/hooks/useSubscription";
import { TokenConfig } from "../../../types/deployment";
import { AntiWhaleConfigPanel } from "./AntiWhaleConfigPanel";
import { DiscoveryModePanel } from "./DiscoveryModePanel";

// Définir l'interface AntiWhaleConfig pour éviter les erreurs de type
export interface AntiWhaleConfig {
  enabled: boolean;
  maxTransactionPercentage: number;
  maxWalletPercentage: number;
}

interface TokenConfigurationFormProps {
  initialConfig?: TokenConfig;
  onChange?: (config: TokenConfig) => void;
  hasMintBurn?: boolean;
  hasBlacklist?: boolean;
}

const defaultAntiWhaleConfig: AntiWhaleConfig = {
  enabled: false,
  maxTransactionPercentage: 1,
  maxWalletPercentage: 3,
};

const defaultConfig: TokenConfig = {
  name: "",
  symbol: "",
  decimals: 18,
  initialSupply: BigInt(0),
  mintable: false,
  burnable: false,
  blacklist: false,
  customTaxPercentage: 0,
  antiWhale: defaultAntiWhaleConfig,
};

export const TokenConfigurationForm: React.FC<TokenConfigurationFormProps> = ({
  initialConfig,
  onChange,
  hasMintBurn = false,
  hasBlacklist = false,
}) => {
  const { checkFeature } = useSubscription();
  const [showDiscoveryMode, setShowDiscoveryMode] = useState(false);
  const [config, setConfig] = useState<TokenConfig>(
    initialConfig || defaultConfig
  );

  // Cette vérification permet de prendre en compte les features du niveau d'abonnement
  // si elles ne sont pas explicitement passées en props
  const hasMintBurnFeature = hasMintBurn || checkFeature("hasMintBurn");
  const hasBlacklistFeature = hasBlacklist || checkFeature("hasBlacklist");
  const hasAdvancedFeatures = checkFeature("hasAdvancedFeatures");
  const maxCustomTax = checkFeature("maxCustomTax") || 0;

  // S'assurer que config.antiWhale est toujours défini
  useEffect(() => {
    if (!config.antiWhale) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        antiWhale: defaultAntiWhaleConfig,
      }));
    }
  }, [config.antiWhale]);

  // Mettre à jour la configuration si initialConfig change
  useEffect(() => {
    if (initialConfig) {
      const updatedConfig = {
        ...initialConfig,
        // S'assurer que antiWhale existe toujours
        antiWhale: initialConfig.antiWhale || defaultAntiWhaleConfig,
      };
      setConfig(updatedConfig);
    }
  }, [initialConfig]);

  // Notifier le parent des changements de configuration
  useEffect(() => {
    if (onChange) {
      onChange(config);
    }
  }, [config, onChange]);

  const handleChange =
    (field: keyof TokenConfig) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      setConfig({ ...config, [field]: value });
    };

  const handleSupplyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Convert to BigInt with 18 decimals
      const rawValue = event.target.value || "0";
      const value = BigInt(Math.floor(parseFloat(rawValue) * 10 ** 18));
      setConfig({ ...config, initialSupply: value });
    } catch (error) {
      console.error("Invalid supply value:", error);
    }
  };

  const getSupplyInputValue = () => {
    try {
      return (Number(config.initialSupply) / 10 ** 18).toString();
    } catch (error) {
      return "0";
    }
  };

  const handleTaxChange = (_: Event, value: number | number[]) => {
    setConfig({ ...config, customTaxPercentage: value as number });
  };

  const handleAntiWhaleChange = (antiWhaleConfig: AntiWhaleConfig) => {
    setConfig({ ...config, antiWhale: antiWhaleConfig });
  };

  const handleTemplateSelect = (templateConfig: TokenConfig) => {
    // S'assurer que antiWhale existe dans le template
    const updatedConfig = {
      ...templateConfig,
      antiWhale: templateConfig.antiWhale || defaultAntiWhaleConfig,
    };
    setConfig(updatedConfig);
    setShowDiscoveryMode(false);
  };

  const toggleDiscoveryMode = () => {
    setShowDiscoveryMode(!showDiscoveryMode);
  };

  const isConfigValid = (): boolean => {
    return (
      !!config.name &&
      config.name.length >= 3 &&
      !!config.symbol &&
      config.symbol.length >= 2 &&
      config.initialSupply > BigInt(0)
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Configuration du Token</Typography>
        <Button
          variant="outlined"
          startIcon={<LightbulbIcon />}
          onClick={toggleDiscoveryMode}
        >
          {showDiscoveryMode ? "Masquer les modèles" : "Explorer des modèles"}
        </Button>
      </Box>

      {showDiscoveryMode && (
        <DiscoveryModePanel onSelectTemplate={handleTemplateSelect} />
      )}

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box component="form" noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nom du Token"
                value={config.name}
                onChange={handleChange("name")}
                helperText="Choisissez un nom unique et mémorable pour votre token"
                error={config.name.length > 0 && config.name.length < 3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Symbole"
                value={config.symbol}
                onChange={handleChange("symbol")}
                helperText="Généralement 3-4 caractères en majuscules (ex: BTC, ETH)"
                error={config.symbol.length > 0 && config.symbol.length < 2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Décimales"
                value={config.decimals}
                onChange={handleChange("decimals")}
                inputProps={{ min: 0, max: 18 }}
                helperText="Standard: 18 (comme ETH). Moins = non divisible, plus = très divisible"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Supply Initiale"
                value={getSupplyInputValue()}
                onChange={handleSupplyChange}
                helperText="Nombre total de tokens à créer initialement"
                error={Number(config.initialSupply) <= 0}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Fonctionnalités Optionnelles
              </Typography>
            </Grid>

            {hasMintBurnFeature && (
              <>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.mintable}
                          onChange={handleChange("mintable")}
                        />
                      }
                      label="Mintable"
                    />
                    <Tooltip title="Permet de créer de nouveaux tokens après le déploiement initial. Utile pour les modèles inflationnistes ou les récompenses.">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.burnable}
                          onChange={handleChange("burnable")}
                        />
                      }
                      label="Burnable"
                    />
                    <Tooltip title="Permet de détruire des tokens, réduisant ainsi l'offre totale. Utile pour les mécanismes déflationnistes.">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </>
            )}

            {hasBlacklistFeature && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.blacklist}
                        onChange={handleChange("blacklist")}
                      />
                    }
                    label="Blacklist"
                  />
                  <Tooltip title="Permet de bloquer certaines adresses de réaliser des transactions. Utile pour la conformité et la sécurité.">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            )}

            {hasAdvancedFeatures &&
              typeof maxCustomTax === "number" &&
              maxCustomTax > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography id="custom-tax-slider" gutterBottom>
                      Taxe de Transaction ({config.customTaxPercentage}%)
                    </Typography>
                    <Slider
                      aria-labelledby="custom-tax-slider"
                      value={config.customTaxPercentage}
                      onChange={handleTaxChange}
                      min={0}
                      max={maxCustomTax}
                      step={0.1}
                      valueLabelDisplay="auto"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Définit un pourcentage de chaque transaction qui sera
                      redistribué ou brûlé.
                    </Typography>
                  </Box>
                </Grid>
              )}

            {hasAdvancedFeatures && (
              <Grid item xs={12}>
                <AntiWhaleConfigPanel
                  config={config.antiWhale || defaultAntiWhaleConfig}
                  onChange={handleAntiWhaleChange}
                />
              </Grid>
            )}

            {!isConfigValid() && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Veuillez remplir tous les champs obligatoires pour continuer.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};
