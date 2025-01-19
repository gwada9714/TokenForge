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
import { useTokenCreation } from '../../../../../../store/hooks';
import { updateTokenConfig } from '../../../../../../store/slices/tokenCreationSlice';
import { TaxConfigurationPanel } from '../../../../../../features/token-creation/components/TaxConfigurationPanel';
import { MaxLimitsConfiguration } from './MaxLimitsConfiguration';
import { LiquidityLockConfiguration } from './LiquidityLockConfiguration';
import { MaxLimits, LiquidityLock, TaxConfig, TokenConfig } from '../../../../../../types/tokenFeatures';
import { NetworkTaxInfo } from '../../../../../../features/token-creation/components/NetworkTaxInfo';
import { useNetworkTaxConfig } from '../../../../../../hooks/useNetworkTaxConfig';
import { GasEstimationPanel } from '../../../../../../features/token-creation/components/GasEstimationPanel';

const featureMap = {
  'Mint': 'mintable',
  'Burn': 'burnable',
  'Pause': 'pausable',
  'Blacklist': 'blacklist',
  'AntiWhale': 'antiWhale'
} as const;

type FeatureKey = keyof typeof featureMap;

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
  const { networkTaxConfig } = useNetworkTaxConfig();

  const handleBasicInfoChange = useCallback((field: keyof TokenConfig, value: string | number) => {
    dispatch(updateTokenConfig({ [field]: value }));
  }, [dispatch]);

  const handleFeatureToggle = useCallback((feature: keyof TokenConfig['features']) => {
    dispatch(updateTokenConfig({
      features: {
        ...tokenConfig.features,
        [feature]: !tokenConfig.features[feature]
      }
    }));
  }, [dispatch, tokenConfig.features]);

  const handleTaxConfigChange = useCallback((taxConfig: TaxConfig) => {
    dispatch(updateTokenConfig({ taxes: taxConfig }));
  }, [dispatch]);

  const handleMaxLimitsChange = useCallback((maxLimits: MaxLimits) => {
    dispatch(updateTokenConfig({ maxLimits }));
  }, [dispatch]);

  const handleLiquidityLockChange = useCallback((liquidityLock: LiquidityLock) => {
    if (typeof liquidityLock.unlockDate === 'object') {
      liquidityLock.unlockDate = Math.floor(liquidityLock.unlockDate.getTime() / 1000);
    }
    dispatch(updateTokenConfig({ liquidityLock }));
  }, [dispatch]);

  const formFields: FormField[] = [
    {
      label: 'Nom du Token',
      field: 'name',
      type: 'text',
      placeholder: 'Ex: My Token',
      required: true
    },
    {
      label: 'Symbole',
      field: 'symbol',
      type: 'text',
      placeholder: 'Ex: MTK',
      required: true
    },
    {
      label: 'Décimales',
      field: 'decimals',
      type: 'number',
      placeholder: '18',
      required: true,
      inputProps: {
        min: 0,
        max: 18
      }
    },
    {
      label: 'Supply Total',
      field: 'totalSupply',
      type: 'text',
      placeholder: 'Ex: 1000000',
      required: true
    }
  ];

  return (
    <Stack spacing={4}>
      <Grid container spacing={3}>
        {formFields.map((field) => (
          <Grid item xs={12} sm={6} key={field.field}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
              {field.required && ' *'}
            </Typography>
            <TextField
              fullWidth
              type={field.type}
              value={tokenConfig[field.field] || ''}
              onChange={(e) => handleBasicInfoChange(field.field, e.target.value)}
              placeholder={field.placeholder}
              size="small"
              required={field.required}
              inputProps={field.inputProps}
            />
          </Grid>
        ))}
      </Grid>

      <Box>
        <Typography variant="h6" gutterBottom>
          Fonctionnalités du Token
          <Tooltip title="Sélectionnez les fonctionnalités que vous souhaitez activer pour votre token">
            <IconButton size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <FormGroup>
          <Grid container spacing={2}>
            {Object.entries(featureMap).map(([key, feature]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tokenConfig.features[feature]}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{key}</span>
                      <Tooltip title={`Description de la fonctionnalité ${key}`}>
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Stack>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>
          Configuration des Taxes
        </Typography>
        <NetworkTaxInfo config={networkTaxConfig} />
        <TaxConfigurationPanel
          config={tokenConfig.taxes}
          onChange={handleTaxConfigChange}
          networkConfig={networkTaxConfig}
        />
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>
          Limites Maximum
        </Typography>
        <MaxLimitsConfiguration
          maxLimits={tokenConfig.maxLimits}
          totalSupply={tokenConfig.totalSupply}
          onChange={handleMaxLimitsChange}
        />
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>
          Verrouillage de Liquidité
        </Typography>
        <LiquidityLockConfiguration
          lockConfig={tokenConfig.liquidityLock}
          onChange={handleLiquidityLockChange}
        />
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>
          Estimation des Frais de Gas
        </Typography>
        <GasEstimationPanel tokenConfig={tokenConfig} />
      </Box>
    </Stack>
  );
};

export default TokenConfiguration;
