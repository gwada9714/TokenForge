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
import { TaxConfigurationPanel } from '../../features/token-creation/components/TaxConfigurationPanel';

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

  // Initialisation des configurations par défaut
  const defaultMaxLimits: MaxLimits = {
    maxWallet: {
      enabled: false,
      amount: '0',
      percentage: 2,
    },
    maxTransaction: {
      enabled: false,
      amount: '0',
      percentage: 1,
    }
  };

  const defaultLockConfig: LiquidityLock = {
    enabled: false,
    amount: '50',
    duration: 180 * 24 * 60 * 60,
    unlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    pair: '',
    dex: 'uniswap'
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Configuration du Token</Typography>
      
      {/* Champs de base */}
      <Grid container spacing={2}>
        {formFields.map((field) => (
          <Grid item xs={12} sm={6} key={field.field}>
            <TextField
              label={field.label}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              value={tokenConfig[field.field] || ''}
              onChange={(e) => handleChange(field.field, e.target.value)}
              fullWidth
              inputProps={field.inputProps}
            />
          </Grid>
        ))}
      </Grid>

      <Divider />

      {/* Fonctionnalités de base */}
      <FormGroup>
        <Typography variant="subtitle1" gutterBottom>
          Fonctionnalités
        </Typography>
        {basicFeatures.map((feature) => (
          <FormControlLabel
            key={feature}
            control={
              <Checkbox
                checked={tokenConfig.features?.includes(feature) || false}
                onChange={() => handleFeatureChange(feature)}
              />
            }
            label={feature}
          />
        ))}
      </FormGroup>

      <Divider />

      {/* Configuration de la Taxe */}
      <TaxConfigurationPanel />

      {/* Autres configurations */}
      <MaxLimitsConfiguration
        maxLimits={tokenConfig.maxLimits || defaultMaxLimits}
        totalSupply={tokenConfig.supply || '0'}
        onChange={handleMaxLimitsChange}
      />

      <LiquidityLockConfiguration
        lockConfig={tokenConfig.liquidityLock || defaultLockConfig}
        onChange={handleLiquidityLockChange}
      />
    </Stack>
  );
});

export default TokenConfiguration;
