import React, { useCallback } from 'react';
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
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTokenCreation } from '@/store/hooks';
import { updateTokenConfig } from '@/store/slices/tokenCreationSlice';
import { isAddress } from '@ethersproject/address';
import { TaxConfig } from '@/types/tokenFeatures';

interface TaxConfigurationPanelProps {
  value?: TaxConfig;
  onChange?: (config: TaxConfig) => void;
}

export const TaxConfigurationPanel: React.FC<TaxConfigurationPanelProps> = ({ value, onChange }) => {
  const defaultConfig: TaxConfig = {
    enabled: false,
    baseTaxRate: 0.5, // 0.5% taxe de base
    additionalTaxRate: 0, // taxe additionnelle configurable
    creatorWallet: '',
    distribution: {
      treasury: 60, // 60% pour TokenForge
      development: 20, // 20% pour le développement
      buyback: 15, // 15% pour le rachat et burn
      staking: 5 // 5% pour les stakers
    }
  };

  const taxConfig = value || defaultConfig;

  const handleChange = useCallback((field: string, value: any) => {
    if (!onChange) return;

    if (field.startsWith('distribution.')) {
      const distField = field.split('.')[1];
      onChange({
        ...taxConfig,
        distribution: {
          ...taxConfig.distribution,
          [distField]: value
        }
      });
    } else {
      onChange({
        ...taxConfig,
        [field]: value
      });
    }
  }, [onChange, taxConfig]);

  const isDistributionValid = 
    taxConfig.distribution.treasury +
    taxConfig.distribution.development +
    taxConfig.distribution.buyback +
    taxConfig.distribution.staking === 100;

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
          <Box display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={taxConfig.enabled}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                />
              }
              label="Activer la taxe"
            />
            {renderTooltip("La taxe de base de 0.5% est obligatoire. Vous pouvez configurer une taxe additionnelle jusqu'à 1.5%.")}
          </Box>

          {taxConfig.enabled && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Taxe Additionnelle (%)"
                    type="number"
                    value={taxConfig.additionalTaxRate}
                    onChange={(e) => handleChange('additionalTaxRate', Math.min(1.5, Math.max(0, Number(e.target.value))))}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 0, max: 1.5, step: 0.1 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Adresse du Créateur"
                    value={taxConfig.creatorWallet}
                    onChange={(e) => handleChange('creatorWallet', e.target.value)}
                    error={!!taxConfig.creatorWallet && !isAddress(taxConfig.creatorWallet)}
                    helperText={taxConfig.creatorWallet && !isAddress(taxConfig.creatorWallet) ? "Adresse invalide" : ""}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Divider />

              <Typography variant="subtitle2" gutterBottom>
                Distribution de la Taxe de Base (0.5%)
                {renderTooltip("La distribution de la taxe de base est fixe et non modifiable")}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Treasury TokenForge"
                    value={`${taxConfig.distribution.treasury}%`}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Développement"
                    value={`${taxConfig.distribution.development}%`}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Rachat et Burn"
                    value={`${taxConfig.distribution.buyback}%`}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Staking"
                    value={`${taxConfig.distribution.staking}%`}
                    disabled
                    fullWidth
                  />
                </Grid>
              </Grid>

              {!isDistributionValid && (
                <Alert severity="error">
                  La distribution totale doit être égale à 100%
                </Alert>
              )}

              <Alert severity="info">
                La taxe additionnelle (jusqu'à 1.5%) est entièrement reversée à l'adresse du créateur.
              </Alert>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
