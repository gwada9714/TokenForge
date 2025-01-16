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

const featureMap = {
  'Mint': 'mintable',
  'Burn': 'burnable',
  'Pause': 'pausable',
  'Blacklist': 'blacklist',
  'AntiWhale': 'antiWhale'
} as const;

type FeatureKey = keyof typeof featureMap;
type FeatureValue = typeof featureMap[FeatureKey];

interface FormField {
  label: string;
  field: keyof Pick<TokenConfig, 'name' | 'symbol' | 'decimals' | 'totalSupply'>;
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
  const { taxConfig: networkTaxConfig } = useNetworkTaxConfig();

  const handleChange = useCallback((field: keyof TokenConfig, value: string | number) => {
    dispatch(updateTokenConfig({ [field]: value }));
  }, [dispatch]);

  const handleFeatureToggle = useCallback((feature: FeatureKey) => {
    const featureKey = featureMap[feature];
    const features = { ...tokenConfig.features };
    features[featureKey] = !features[featureKey];
    dispatch(updateTokenConfig({ features }));
  }, [dispatch, tokenConfig.features]);

  const handleTaxConfigChange = useCallback((newTaxConfig: TaxConfig) => {
    dispatch(updateTokenConfig({ taxes: newTaxConfig }));
  }, [dispatch]);

  const handleMaxLimitsChange = useCallback((maxLimits: MaxLimits) => {
    dispatch(updateTokenConfig({ maxLimits }));
  }, [dispatch]);

  const handleLiquidityLockChange = useCallback((liquidityLock: LiquidityLock) => {
    if (liquidityLock.unlockDate instanceof Date) {
      liquidityLock.unlockDate = Math.floor(liquidityLock.unlockDate.getTime() / 1000);
    }
    dispatch(updateTokenConfig({ liquidityLock }));
  }, [dispatch]);

  const getFeatureDescription = (feature: FeatureKey) => {
    const tooltips: Record<FeatureKey, string> = {
      Mint: "Permet de créer de nouveaux tokens après le déploiement",
      Burn: "Permet de détruire des tokens de manière permanente",
      Pause: "Permet de suspendre temporairement les transferts de tokens",
      Blacklist: "Permet de bloquer certaines adresses",
      AntiWhale: "Limite la quantité maximale de tokens par portefeuille et par transaction"
    };

    return tooltips[feature] || "";
  };

  const formFields: FormField[] = [
    {
      label: 'Token Name',
      field: 'name',
      type: 'text',
      placeholder: 'My Token',
      required: true,
    },
    {
      label: 'Token Symbol',
      field: 'symbol',
      type: 'text',
      placeholder: 'MTK',
      required: true,
    },
    {
      label: 'Total Supply',
      field: 'totalSupply',
      type: 'text',
      placeholder: '1000000',
      required: true,
    },
    {
      label: 'Decimals',
      field: 'decimals',
      type: 'number',
      placeholder: '18',
      required: true,
      inputProps: {
        min: 0,
        max: 18,
      },
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
            {Object.keys(featureMap).map((feature) => (
              <Grid item xs={12} sm={6} key={feature}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tokenConfig.features?.[featureMap[feature as FeatureKey]] ?? false}
                      onChange={() => handleFeatureToggle(feature as FeatureKey)}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>{feature}</Typography>
                      <Tooltip title={getFeatureDescription(feature as FeatureKey)}>
                        <IconButton size="small">
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
          value={tokenConfig.taxes}
          onChange={(taxConfig) => handleTaxConfigChange(taxConfig)}
          maxAdditionalTaxRate={networkTaxConfig.maxAdditionalTaxRate}
        />
      </div>

      <Box mt={3}>
        <GasEstimationPanel />
      </Box>

      <Divider />

      {tokenConfig.features?.antiWhale && (
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Anti-Whale Configuration
          </Typography>
          <MaxLimitsConfiguration
            maxLimits={{
              maxWallet: { enabled: false, amount: '0', percentage: 2 },
              maxTransaction: { enabled: false, amount: '0', percentage: 1 }
            }}
            totalSupply={tokenConfig.totalSupply}
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
