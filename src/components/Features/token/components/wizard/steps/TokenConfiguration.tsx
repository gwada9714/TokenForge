import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
} from '@mui/material';
import { TokenConfig, TokenFeatures } from '../../../types';
import { useTokenCreation } from '../../../hooks/useTokenCreation';
import { validateTokenConfig } from '../../../utils/validation';
import { TOKEN_VALIDATION } from '../../../constants';

interface TokenConfigurationProps {
  config: TokenConfig | null;
  onConfigUpdate: (config: TokenConfig) => void;
  plan: 'basic' | 'premium' | null;
}

const TokenConfiguration: React.FC<TokenConfigurationProps> = ({
  config,
  onConfigUpdate,
  plan,
}) => {
  const {
    config: localConfig,
    features,
    updateConfig,
    updateFeatures,
  } = useTokenCreation();

  const errors = validateTokenConfig(localConfig);
  const hasErrors = Object.values(errors).some(error => error !== null);

  // Sync local state with parent when valid
  React.useEffect(() => {
    if (!hasErrors) {
      onConfigUpdate({
        ...localConfig,
        features,
      });
    }
  }, [localConfig, features, hasErrors, onConfigUpdate]);

  const isPremium = plan === 'premium';

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Token Name"
            value={localConfig.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Token Symbol"
            value={localConfig.symbol}
            onChange={(e) => updateConfig({ symbol: e.target.value })}
            error={!!errors.symbol}
            helperText={errors.symbol}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Decimals"
            type="number"
            value={localConfig.decimals}
            onChange={(e) => updateConfig({ decimals: parseInt(e.target.value, 10) })}
            error={!!errors.decimals}
            helperText={errors.decimals}
            inputProps={{
              min: 0,
              max: TOKEN_VALIDATION.MAX_DECIMALS,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Total Supply"
            type="number"
            value={localConfig.totalSupply}
            onChange={(e) => updateConfig({ totalSupply: e.target.value })}
            error={!!errors.totalSupply}
            helperText={errors.totalSupply}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Features
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={features.mintable}
                onChange={(e) => updateFeatures({ mintable: e.target.checked })}
                disabled={!isPremium}
              />
            }
            label="Mintable"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={features.burnable}
                onChange={(e) => updateFeatures({ burnable: e.target.checked })}
              />
            }
            label="Burnable"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={features.pausable}
                onChange={(e) => updateFeatures({ pausable: e.target.checked })}
                disabled={!isPremium}
              />
            }
            label="Pausable"
          />
        </Grid>

        {!isPremium && (
          <Grid item xs={12}>
            <Alert severity="info">
              Upgrade to Premium to unlock additional features like Mintable and Pausable tokens.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default React.memo(TokenConfiguration);
