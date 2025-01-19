import React from 'react';
import { TextField, Switch, FormControlLabel, Button, Box } from '@mui/material';
import { useTokenCreation } from '../hooks/useTokenCreation';
import { validateTokenConfig } from '../utils/validation';

export const TokenCreationForm: React.FC = () => {
  const {
    config,
    features,
    deploymentStatus,
    updateConfig,
    updateFeatures,
    resetForm,
  } = useTokenCreation();

  const errors = validateTokenConfig(config);
  const hasErrors = Object.values(errors).some(error => error !== null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;
    
    // Token deployment logic will be implemented here
    console.log('Deploying token with config:', { config, features });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <TextField
        fullWidth
        label="Token Name"
        value={config.name}
        onChange={(e) => updateConfig({ name: e.target.value })}
        error={!!errors.name}
        helperText={errors.name}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label="Token Symbol"
        value={config.symbol}
        onChange={(e) => updateConfig({ symbol: e.target.value })}
        error={!!errors.symbol}
        helperText={errors.symbol}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label="Total Supply"
        type="number"
        value={config.totalSupply}
        onChange={(e) => updateConfig({ totalSupply: e.target.value })}
        error={!!errors.totalSupply}
        helperText={errors.totalSupply}
        margin="normal"
      />
      
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={features.mintable}
              onChange={(e) => updateFeatures({ mintable: e.target.checked })}
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
            />
          }
          label="Pausable"
        />
      </Box>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          type="submit"
          disabled={hasErrors || deploymentStatus.status === 'deploying'}
        >
          Create Token
        </Button>
        
        <Button
          variant="outlined"
          onClick={resetForm}
          disabled={deploymentStatus.status === 'deploying'}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};
