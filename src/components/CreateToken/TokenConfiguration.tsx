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

  const renderFeatures = useMemo(() => (
    <Grid container spacing={2}>
      {features.map((feature) => (
        <Grid item xs={12} sm={6} md={4} key={feature}>
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
  ), [tokenConfig.features, handleFeatureChange]);

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ mb: 2 }}>Configuration du Token</Typography>
      {renderFormFields}
      <FormControl component="fieldset">
        <FormLabel component="legend">Fonctionnalités</FormLabel>
        <FormGroup>
          {renderFeatures}
        </FormGroup>
      </FormControl>
    </Stack>
  );
});

export default TokenConfiguration;
