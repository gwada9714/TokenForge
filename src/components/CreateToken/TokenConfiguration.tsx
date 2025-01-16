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
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTokenCreation } from '@/store/hooks';
import { updateTokenConfig } from '@/store/slices/tokenCreationSlice';
import { TaxConfigurationPanel } from '../../features/token-creation/components/TaxConfigurationPanel';
import { MaxLimitsConfiguration } from './MaxLimitsConfiguration';
import { LiquidityLockConfiguration } from './LiquidityLockConfiguration';
import { MaxLimits, LiquidityLock, TaxConfig } from '@/types/tokenFeatures';

const basicFeatures = [
  'Mint',
  'Burn',
  'Pause',
  'Blacklist',
  'AntiWhale',
] as const;

const TokenConfiguration: React.FC = () => {
  const { tokenConfig, dispatch } = useTokenCreation();

  const handleChange = useCallback((field: keyof typeof tokenConfig, value: any) => {
    dispatch(updateTokenConfig({ [field]: value }));
  }, [dispatch]);

  const handleFeatureChange = useCallback((feature: string) => {
    const currentFeatures = tokenConfig.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    dispatch(updateTokenConfig({ features: newFeatures }));
  }, [dispatch, tokenConfig.features]);

  const handleMaxLimitsChange = useCallback((maxLimits: MaxLimits) => {
    dispatch(updateTokenConfig({ maxLimits }));
  }, [dispatch]);

  const handleTaxConfigChange = useCallback((taxConfig: TaxConfig) => {
    dispatch(updateTokenConfig({ taxConfig }));
  }, [dispatch]);

  const handleLiquidityLockChange = useCallback((lockConfig: LiquidityLock) => {
    dispatch(updateTokenConfig({ liquidityLock: lockConfig }));
  }, [dispatch]);

  const renderFeatureTooltip = (feature: string) => {
    const tooltips: Record<string, string> = {
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

  const formFields = [
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
      required: true,
    },
  ];

  return (
    <Stack spacing={4}>
      <Typography variant="h6" gutterBottom>
        Configuration du Token
      </Typography>

      <div>
        <Typography variant="subtitle1" gutterBottom>
          Champs de Base
        </Typography>
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
                      checked={tokenConfig.features?.includes(feature) || false}
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

      <div>
        <Typography variant="subtitle1" gutterBottom>
          Configuration des Taxes
        </Typography>
        <TaxConfigurationPanel
          value={tokenConfig.taxConfig}
          onChange={handleTaxConfigChange}
        />
      </div>

      <Divider />

      {tokenConfig.features?.includes('AntiWhale') && (
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Configuration Anti-Whale
          </Typography>
          <MaxLimitsConfiguration
            maxLimits={tokenConfig.maxLimits || {
              maxWallet: { enabled: false, amount: '0', percentage: 2 },
              maxTransaction: { enabled: false, amount: '0', percentage: 1 }
            }}
            totalSupply={tokenConfig.supply || '0'}
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
          lockConfig={tokenConfig.liquidityLock || {
            enabled: false,
            amount: '50',
            duration: 180 * 24 * 60 * 60,
            unlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            pair: '',
            dex: 'uniswap'
          }}
          onChange={handleLiquidityLockChange}
          disabled={false}
        />
      </div>
    </Stack>
  );
};

export default TokenConfiguration;
