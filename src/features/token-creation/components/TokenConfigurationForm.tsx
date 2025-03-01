import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { TokenConfig } from '../../../types/deployment';
import { AntiWhaleConfigPanel } from './AntiWhaleConfigPanel';
import { DiscoveryModePanel } from './DiscoveryModePanel';

export const TokenConfigurationForm: React.FC = () => {
  const { checkFeature } = useSubscription();
  const [showDiscoveryMode, setShowDiscoveryMode] = useState(false);
  const [config, setConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: BigInt(0),
    mintable: false,
    burnable: false,
    blacklist: false,
    customTaxPercentage: 0,
    antiWhale: {
      enabled: false,
      maxTransactionPercentage: 1,
      maxWalletPercentage: 3
    }
  });

  const hasMintBurn = checkFeature('hasMintBurn');
  const hasBlacklist = checkFeature('hasBlacklist');
  const hasAdvancedFeatures = checkFeature('hasAdvancedFeatures');
  const maxCustomTax = checkFeature('maxCustomTax') || 0;

  const handleChange = (field: keyof TokenConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;
    setConfig({ ...config, [field]: value });
  };

  const handleSupplyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Convert to BigInt with 18 decimals
      const rawValue = event.target.value || '0';
      const value = BigInt(Math.floor(parseFloat(rawValue) * 10**18));
      setConfig({ ...config, initialSupply: value });
    } catch (error) {
      console.error('Invalid supply value:', error);
    }
  };

  const getSupplyInputValue = () => {
    try {
      return (Number(config.initialSupply) / 10**18).toString();
    } catch (error) {
      return '0';
    }
  };

  const handleTaxChange = (_: Event, value: number | number[]) => {
    setConfig({ ...config, customTaxPercentage: value as number });
  };

  const handleAntiWhaleChange = (antiWhaleConfig: {
    enabled: boolean;
    maxTransactionPercentage: number;
    maxWalletPercentage: number;
  }) => {
    setConfig({ ...config, antiWhale: antiWhaleConfig });
  };

  const handleTemplateSelect = (templateConfig: TokenConfig) => {
    setConfig(templateConfig);
    setShowDiscoveryMode(false);
  };

  const toggleDiscoveryMode = () => {
    setShowDiscoveryMode(!showDiscoveryMode);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Configuration du Token</Typography>
        <Button
          variant="outlined"
          startIcon={<LightbulbIcon />}
          onClick={toggleDiscoveryMode}
        >
          {showDiscoveryMode ? 'Masquer les modèles' : 'Explorer des modèles'}
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
                onChange={handleChange('name')}
                helperText="Choisissez un nom unique et mémorable pour votre token"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Symbole"
                value={config.symbol}
                onChange={handleChange('symbol')}
                helperText="Généralement 3-4 caractères en majuscules (ex: BTC, ETH)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Décimales"
                value={config.decimals}
                onChange={handleChange('decimals')}
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
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Fonctionnalités Optionnelles
              </Typography>
            </Grid>

            {hasMintBurn && (
              <>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.mintable}
                          onChange={handleChange('mintable')}
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.burnable}
                          onChange={handleChange('burnable')}
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

            {hasBlacklist && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.blacklist}
                        onChange={handleChange('blacklist')}
                      />
                    }
                    label="Activer la Blacklist"
                  />
                  <Tooltip title="Permet de bloquer certaines adresses, les empêchant d'effectuer des transactions avec le token. Utile pour la conformité réglementaire.">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            )}

            {typeof maxCustomTax === 'number' && maxCustomTax > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography>
                    Taxe Personnalisée (max {maxCustomTax}%)
                  </Typography>
                  <Tooltip title="Une taxe appliquée sur chaque transaction. Cette taxe est redistribuée selon les paramètres que vous définissez.">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={config.customTaxPercentage}
                  onChange={handleTaxChange}
                  min={0}
                  max={typeof maxCustomTax === 'number' ? maxCustomTax : 0}
                  step={0.1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Alert severity="info">
                Une taxe de forge de 0.5% sera automatiquement appliquée à toutes les transactions.
              </Alert>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {hasAdvancedFeatures && (
        <AntiWhaleConfigPanel 
          config={config.antiWhale || { enabled: false, maxTransactionPercentage: 1, maxWalletPercentage: 3 }}
          onChange={handleAntiWhaleChange}
        />
      )}
    </Box>
  );
};
