import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  Slider,
  Grid,
  Tooltip,
  Alert,
} from '@mui/material';
import { TaxConfig } from '@/types/tokenFeatures';
import InfoIcon from '@mui/icons-material/Info';

interface TaxConfigurationProps {
  taxConfig: TaxConfig;
  onChange: (config: TaxConfig) => void;
  disabled?: boolean;
}

const MAX_TOTAL_TAX = 25; // Maximum total tax percentage
const MIN_FORGE_SHARE = 10; // Minimum forge share percentage

export const TaxConfiguration: React.FC<TaxConfigurationProps> = ({
  taxConfig,
  onChange,
  disabled = false,
}) => {
  const handleTaxChange = (field: keyof TaxConfig, value: number | boolean) => {
    const newConfig = { ...taxConfig, [field]: value };
    
    // Ajuster les parts de distribution si nécessaire
    if (field === 'enabled' && value === true) {
      newConfig.forgeShare = Math.max(MIN_FORGE_SHARE, newConfig.forgeShare);
      const remainingShare = 100 - newConfig.forgeShare;
      newConfig.redistributionShare = Math.floor(remainingShare * 0.4);
      newConfig.liquidityShare = Math.floor(remainingShare * 0.4);
      newConfig.burnShare = remainingShare - newConfig.redistributionShare - newConfig.liquidityShare;
    }

    onChange(newConfig);
  };

  const handleShareChange = (field: 'redistributionShare' | 'liquidityShare' | 'burnShare', value: number) => {
    const newConfig = { ...taxConfig };
    const totalOtherShares = (field !== 'redistributionShare' ? newConfig.redistributionShare : 0) +
                            (field !== 'liquidityShare' ? newConfig.liquidityShare : 0) +
                            (field !== 'burnShare' ? newConfig.burnShare : 0);
    
    // Vérifier que la somme des parts ne dépasse pas 100 - forgeShare
    if (value + totalOtherShares + newConfig.forgeShare <= 100) {
      newConfig[field] = value;
      onChange(newConfig);
    }
  };

  const totalTax = (taxConfig.buyTax + taxConfig.sellTax + taxConfig.transferTax) / 3;
  const isMaxTaxExceeded = totalTax > MAX_TOTAL_TAX;

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="h6">Configuration des Taxes</Typography>
          <Tooltip title="Les taxes sont prélevées sur chaque transaction et distribuées selon les paramètres définis">
            <InfoIcon color="info" fontSize="small" />
          </Tooltip>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={taxConfig.enabled}
              onChange={(e) => handleTaxChange('enabled', e.target.checked)}
              disabled={disabled}
            />
          }
          label="Activer les taxes"
        />

        {taxConfig.enabled && (
          <Box mt={2}>
            <Grid container spacing={3}>
              {/* Taux de taxe */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Taxe à l'achat (%)
                  </Typography>
                  <TextField
                    type="number"
                    value={taxConfig.buyTax}
                    onChange={(e) => handleTaxChange('buyTax', Math.max(0, Math.min(25, Number(e.target.value))))}
                    inputProps={{ min: 0, max: 25, step: 0.1 }}
                    disabled={disabled}
                    size="small"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Taxe à la vente (%)
                  </Typography>
                  <TextField
                    type="number"
                    value={taxConfig.sellTax}
                    onChange={(e) => handleTaxChange('sellTax', Math.max(0, Math.min(25, Number(e.target.value))))}
                    inputProps={{ min: 0, max: 25, step: 0.1 }}
                    disabled={disabled}
                    size="small"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Taxe au transfert (%)
                  </Typography>
                  <TextField
                    type="number"
                    value={taxConfig.transferTax}
                    onChange={(e) => handleTaxChange('transferTax', Math.max(0, Math.min(25, Number(e.target.value))))}
                    inputProps={{ min: 0, max: 25, step: 0.1 }}
                    disabled={disabled}
                    size="small"
                  />
                </FormControl>
              </Grid>

              {/* Distribution des taxes */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Distribution des Taxes
                </Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Part de la Forge ({taxConfig.forgeShare}%)
                  </Typography>
                  <Slider
                    value={taxConfig.forgeShare}
                    onChange={(_, value) => handleTaxChange('forgeShare', value as number)}
                    min={MIN_FORGE_SHARE}
                    max={50}
                    disabled
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Redistribution ({taxConfig.redistributionShare}%)
                </Typography>
                <Slider
                  value={taxConfig.redistributionShare}
                  onChange={(_, value) => handleShareChange('redistributionShare', value as number)}
                  min={0}
                  max={100 - taxConfig.forgeShare}
                  disabled={disabled}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Liquidité ({taxConfig.liquidityShare}%)
                </Typography>
                <Slider
                  value={taxConfig.liquidityShare}
                  onChange={(_, value) => handleShareChange('liquidityShare', value as number)}
                  min={0}
                  max={100 - taxConfig.forgeShare}
                  disabled={disabled}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Burn ({taxConfig.burnShare}%)
                </Typography>
                <Slider
                  value={taxConfig.burnShare}
                  onChange={(_, value) => handleShareChange('burnShare', value as number)}
                  min={0}
                  max={100 - taxConfig.forgeShare}
                  disabled={disabled}
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Warnings */}
              {isMaxTaxExceeded && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    La moyenne des taxes dépasse {MAX_TOTAL_TAX}%. Cela pourrait rendre le token moins attractif pour les traders.
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Alert severity="info">
                  La part de la Forge est fixée à un minimum de {MIN_FORGE_SHARE}% pour assurer le développement continu de la plateforme.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
