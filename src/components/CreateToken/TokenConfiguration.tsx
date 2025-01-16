import React, { useCallback } from 'react';
import {
  Stack,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  TextField,
  Tooltip,
  IconButton,
  Box,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTokenCreation } from '@/store/hooks';
import { updateTokenConfig } from '@/store/slices/tokenCreationSlice';
import { TaxConfigurationPanel } from '../../features/token-creation/components/TaxConfigurationPanel';
import { MaxLimitsConfiguration } from './MaxLimitsConfiguration';
import { LiquidityLockConfiguration } from './LiquidityLockConfiguration';
import { MaxLimits, LiquidityLock, TaxConfig } from '@/types/tokenFeatures';
import type { TokenConfig } from '@/types/tokenFeatures';
import { NetworkTaxInfo } from '@/features/token-creation/components/NetworkTaxInfo';
import { useNetworkTaxConfig } from '@/hooks/useNetworkTaxConfig';
import { GasEstimationPanel } from '@/features/token-creation/components/GasEstimationPanel';

const basicFeatures = [
  'Mint',
  'Burn',
  'Pause',
  'Blacklist',
  'AntiWhale',
] as const;

type BasicFeature = typeof basicFeatures[number];

interface FormField {
  label: string;
  field: 'name' | 'symbol' | 'decimals' | 'supply';
  type: 'text' | 'number';
  placeholder?: string;
  required?: boolean;
  inputProps?: {
    min?: number;
    max?: number;
  };
}

const TokenConfiguration: React.FC = () => {
  const { tokenConfig, dispatch } = useTokenCreation();
  const { taxConfig } = useNetworkTaxConfig();

  const handleChange = useCallback((field: keyof Pick<TokenConfig, 'name' | 'symbol' | 'decimals' | 'supply'>, value: string | number) => {
    dispatch(updateTokenConfig({ [field]: value }));
  }, [dispatch]);

  const handleFeatureChange = useCallback((feature: BasicFeature) => {
    const currentFeatures = tokenConfig.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    dispatch(updateTokenConfig({ features: newFeatures }));
  }, [dispatch, tokenConfig.features]);

  const handleMaxLimitsChange = useCallback((maxLimits: MaxLimits) => {
    dispatch(updateTokenConfig({ maxLimits }));
  }, [dispatch]);

  const handleTaxConfigChange = useCallback((newTaxConfig: TaxConfig) => {
    const update: Partial<TokenConfig> = { taxConfig: newTaxConfig };
    dispatch(updateTokenConfig(update));
  }, [dispatch]);

  const handleLiquidityLockChange = useCallback((lockConfig: LiquidityLock) => {
    dispatch(updateTokenConfig({ liquidityLock: lockConfig }));
  }, [dispatch]);

  const renderFeatureTooltip = (feature: BasicFeature) => {
    const tooltips: Record<BasicFeature, string> = {
      Mint: "Permet de créer de nouveaux tokens après le déploiement",
      Burn: "Permet de détruire des tokens de manière permanente",
      Pause: "Permet de suspendre temporairement les transferts de tokens",
      Blacklist: "Permet de bloquer certaines adresses",
      AntiWhale: "Limite la quantité maximale de tokens par portefeuille et par transaction"
    };

    return (
      <Tooltip title={tooltips[feature] || ""} arrow placement="top">
        <IconButton size="small" sx={{ ml: 1 }}>
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  };

  const formFields: Array<FormField & { field: keyof Pick<TokenConfig, 'name' | 'symbol' | 'decimals' | 'supply'> }> = [
    {
      label: 'Nom',
      field: 'name',
      type: 'text',
      placeholder: 'Ex: Mon Token',
      required: true,
    },
    {
      label: 'Symbole',
      field: 'symbol',
      type: 'text',
      placeholder: 'Ex: TKN',
      required: true,
    },
    {
      label: 'Offre Totale',
      field: 'supply',
      type: 'number',
      inputProps: { min: 1 },
      required: true,
    },
    {
      label: 'Décimales',
      field: 'decimals',
      type: 'number',
      inputProps: { min: 0, max: 18 },
      required: true,
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Configuration du Token
      </Typography>

      <div>
        <Typography variant="subtitle1" gutterBottom>
          Champs de Base
        </Typography>
        <Grid container spacing={2}>
          {formFields.map((field) => (
            <Grid item xs={12} sm={6} key={String(field.field)}>
              <TextField
                label={field.label}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={tokenConfig[field.field] ?? ''}
                onChange={(e) => handleChange(field.field, e.target.value)}
                fullWidth
                inputProps={field.inputProps}
              />
            </Grid>
          ))}
        </Grid>
      </div>

      <Divider />

      <div>
        <Typography variant="subtitle1" gutterBottom>
          Fonctionnalités de Base
        </Typography>
        <FormGroup>
          <Grid container spacing={2}>
            {basicFeatures.map((feature) => (
              <Grid item xs={12} sm={6} key={feature}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tokenConfig.features?.includes(feature) ?? false}
                      onChange={() => handleFeatureChange(feature)}
                    />
                  }
                  label={
                    <Stack direction="row" alignItems="center">
                      {feature}
                      {renderFeatureTooltip(feature)}
                    </Stack>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </div>

      <Divider />

      <NetworkTaxInfo />

      <div>
        <Typography variant="subtitle1" gutterBottom>
          Configuration des Taxes
        </Typography>
        <TaxConfigurationPanel
          value={tokenConfig.taxConfig}
          onChange={(taxConfig) => handleChange('taxConfig', taxConfig)}
          maxAdditionalTaxRate={taxConfig.maxAdditionalTaxRate}
        />
      </div>

      <Box mt={3}>
        <GasEstimationPanel />
      </Box>

      <Divider />

      {tokenConfig.features?.includes('AntiWhale') && (
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Configuration Anti-Whale
          </Typography>
          <MaxLimitsConfiguration
            maxLimits={tokenConfig.maxLimits ?? {
              maxWallet: { enabled: false, amount: '0', percentage: 2 },
              maxTransaction: { enabled: false, amount: '0', percentage: 1 }
            }}
            totalSupply={tokenConfig.supply ?? '0'}
            onChange={handleMaxLimitsChange}
            disabled={false}
          />
        </div>
      )}

      <Divider />

      <div>
        <Typography variant="subtitle1" gutterBottom>
          Configuration du Verrouillage de Liquidité
        </Typography>
        <LiquidityLockConfiguration
          lockConfig={tokenConfig.liquidityLock ?? {
            enabled: false,
            amount: '50',
            unlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            beneficiary: ''
          }}
          onChange={handleLiquidityLockChange}
          disabled={false}
        />
      </div>
    </Stack>
  );
};

export default TokenConfiguration;
