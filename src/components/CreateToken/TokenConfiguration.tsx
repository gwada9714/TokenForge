import React, { useCallback, useMemo } from 'react';
import {
  Stack,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Box,
} from '@mui/material';
import { TokenConfig } from '@/types/token';
import { TaxConfiguration } from './TaxConfiguration';
import { LiquidityLockConfiguration } from './LiquidityLockConfiguration';
import { MaxLimitsConfiguration } from './MaxLimitsConfiguration';
import { TaxConfig, LiquidityLock, MaxLimits } from '@/types/tokenFeatures';

interface TokenConfigurationProps {
  tokenConfig: TokenConfig;
  setTokenConfig: React.Dispatch<React.SetStateAction<TokenConfig>>;
}

const basicFeatures = [
  'Mint',
  'Burn',
  'Pause',
  'Blacklist',
] as const;

const TokenConfiguration: React.FC<TokenConfigurationProps> = React.memo(({
  tokenConfig,
  setTokenConfig,
}) => {
  const handleChange = useCallback((field: keyof TokenConfig, value: any) => {
    setTokenConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, [setTokenConfig]);

  const handleFeatureChange = useCallback((feature: string) => {
    setTokenConfig((prev) => {
      const currentFeatures = prev.features || [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter(f => f !== feature)
        : [...currentFeatures, feature];
      return { ...prev, features: newFeatures };
    });
  }, [setTokenConfig]);

  const handleTaxConfigChange = useCallback((taxConfig: TaxConfig) => {
    setTokenConfig((prev) => ({
      ...prev,
      taxConfig,
    }));
  }, [setTokenConfig]);

  const handleLiquidityLockChange = useCallback((liquidityLock: LiquidityLock) => {
    setTokenConfig((prev) => ({
      ...prev,
      liquidityLock,
    }));
  }, [setTokenConfig]);

  const handleMaxLimitsChange = useCallback((maxLimits: MaxLimits) => {
    setTokenConfig((prev) => ({
      ...prev,
      maxLimits,
    }));
  }, [setTokenConfig]);

  const formFields = useMemo(() => [
    {
      label: 'Nom du Token',
      field: 'name' as const,
      type: 'text',
      placeholder: 'Ex: TokenForge Token',
      required: true,
    },
    {
      label: 'Symbole',
      field: 'symbol' as const,
      type: 'text',
      placeholder: 'Ex: TKN',
      required: true,
    },
    {
      label: 'Offre Totale',
      field: 'supply' as const,
      type: 'number',
      inputProps: { min: 1 },
      required: true,
    },
    {
      label: 'Décimales',
      field: 'decimals' as const,
      type: 'number',
      inputProps: { min: 0, max: 18 },
      required: false,
    },
  ], []);

  const renderFormFields = useMemo(() => formFields.map((field) => (
    <FormControl key={field.field} required={field.required}>
      <FormLabel>{field.label}</FormLabel>
      <TextField
        fullWidth
        type={field.type}
        value={tokenConfig[field.field]}
        onChange={(e) => handleChange(field.field, field.type === 'number' ? parseInt(e.target.value) : e.target.value)}
        placeholder={field.placeholder}
        inputProps={field.inputProps}
        variant="outlined"
      />
    </FormControl>
  )), [tokenConfig, handleChange, formFields]);

  return (
    <Stack spacing={4}>
      {/* Configuration de Base */}
      <Box>
        <Typography variant="h6" gutterBottom>Configuration de Base</Typography>
        <Stack spacing={2}>
          {renderFormFields}
        </Stack>
      </Box>

      <Divider />

      {/* Fonctionnalités de Base */}
      <Box>
        <Typography variant="h6" gutterBottom>Fonctionnalités de Base</Typography>
        <FormGroup>
          <Grid container spacing={2}>
            {basicFeatures.map((feature) => (
              <Grid item xs={12} sm={6} md={3} key={feature}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tokenConfig.features?.includes(feature) || false}
                      onChange={() => handleFeatureChange(feature)}
                    />
                  }
                  label={feature}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Box>

      <Divider />

      {/* Configuration des Taxes */}
      <TaxConfiguration
        taxConfig={tokenConfig.taxConfig || {
          enabled: false,
          buyTax: 5,
          sellTax: 5,
          transferTax: 2,
          recipient: '',
          forgeShare: 10,
          redistributionShare: 30,
          liquidityShare: 30,
          burnShare: 30,
        }}
        onChange={handleTaxConfigChange}
      />

      <Divider />

      {/* Configuration du Verrouillage de Liquidité */}
      <LiquidityLockConfiguration
        lockConfig={tokenConfig.liquidityLock || {
          enabled: false,
          amount: '50',
          duration: 180 * 24 * 60 * 60,
          unlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          pair: '',
          dex: 'uniswap',
        }}
        onChange={handleLiquidityLockChange}
      />

      <Divider />

      {/* Configuration des Limites Maximum */}
      <MaxLimitsConfiguration
        maxLimits={tokenConfig.maxLimits || {
          maxWallet: {
            enabled: false,
            amount: '0',
            percentage: 2,
          },
          maxTransaction: {
            enabled: false,
            amount: '0',
            percentage: 1,
          },
        }}
        totalSupply={tokenConfig.supply || '0'}
        onChange={handleMaxLimitsChange}
      />
    </Stack>
  );
});

export default TokenConfiguration;
