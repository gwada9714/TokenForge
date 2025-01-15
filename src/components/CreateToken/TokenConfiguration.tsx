import React, { useCallback } from 'react';
import {
  Stack,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import { TokenConfig } from '@/types/token';

interface TokenConfigurationProps {
  tokenConfig: TokenConfig;
  setTokenConfig: React.Dispatch<React.SetStateAction<TokenConfig>>;
}

const features = [
  'Mint',
  'Burn',
  'Pause',
  'Blacklist',
  'Anti-Bot',
  'Max Transaction',
  'Max Wallet',
];

const TokenConfiguration: React.FC<TokenConfigurationProps> = ({
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

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ mb: 2 }}>Configuration du Token</Typography>

      <FormControl required>
        <FormLabel>Nom du Token</FormLabel>
        <TextField
          fullWidth
          value={tokenConfig.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ex: TokenForge Token"
          variant="outlined"
        />
      </FormControl>

      <FormControl required>
        <FormLabel>Symbole</FormLabel>
        <TextField
          fullWidth
          value={tokenConfig.symbol}
          onChange={(e) => handleChange('symbol', e.target.value)}
          placeholder="Ex: TKN"
          variant="outlined"
        />
      </FormControl>

      <FormControl required>
        <FormLabel>Offre Totale</FormLabel>
        <TextField
          fullWidth
          type="number"
          value={tokenConfig.supply}
          onChange={(e) => handleChange('supply', e.target.value)}
          inputProps={{ min: 1 }}
          variant="outlined"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Décimales</FormLabel>
        <TextField
          fullWidth
          type="number"
          value={tokenConfig.decimals}
          onChange={(e) => handleChange('decimals', parseInt(e.target.value))}
          inputProps={{ min: 0, max: 18 }}
          variant="outlined"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Fonctionnalités</FormLabel>
        <FormGroup>
          <Grid container spacing={2}>
            {features.map((feature) => (
              <Grid item xs={6} sm={4} md={3} key={feature}>
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
      </FormControl>
    </Stack>
  );
};

export default React.memo(TokenConfiguration);
