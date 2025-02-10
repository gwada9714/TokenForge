import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Slider,
  Alert,
  Grid
} from '@mui/material';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';

interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  mintable: boolean;
  burnable: boolean;
  blacklist: boolean;
  customTaxPercentage: number;
}

export const TokenConfigurationForm: React.FC = () => {
  const { checkFeature } = useSubscription();
  const [config, setConfig] = React.useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: '',
    mintable: false,
    burnable: false,
    blacklist: false,
    customTaxPercentage: 0
  });

  const hasMintBurn = checkFeature('hasMintBurn');
  const hasBlacklist = checkFeature('hasBlacklist');
  const maxCustomTax = checkFeature('maxCustomTax') || 0;

  const handleChange = (field: keyof TokenConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;
    setConfig({ ...config, [field]: value });
  };

  const handleTaxChange = (_: Event, value: number | number[]) => {
    setConfig({ ...config, customTaxPercentage: value as number });
  };

  return (
    <Box component="form" noValidate sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Nom du Token"
            value={config.name}
            onChange={handleChange('name')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Symbole"
            value={config.symbol}
            onChange={handleChange('symbol')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            label="Décimales"
            value={config.decimals}
            onChange={handleChange('decimals')}
            inputProps={{ min: 0, max: 18 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Supply Initiale"
            value={config.initialSupply}
            onChange={handleChange('initialSupply')}
          />
        </Grid>

        {hasMintBurn && (
          <>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.mintable}
                    onChange={handleChange('mintable')}
                  />
                }
                label="Mintable"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.burnable}
                    onChange={handleChange('burnable')}
                  />
                }
                label="Burnable"
              />
            </Grid>
          </>
        )}

        {hasBlacklist && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.blacklist}
                  onChange={handleChange('blacklist')}
                />
              }
              label="Activer la Blacklist"
            />
          </Grid>
        )}

        {maxCustomTax > 0 && (
          <Grid item xs={12}>
            <Typography gutterBottom>
              Taxe Personnalisée (max {maxCustomTax}%)
            </Typography>
            <Slider
              value={config.customTaxPercentage}
              onChange={handleTaxChange}
              min={0}
              max={maxCustomTax}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Alert severity="info">
            Une taxe de forge de 0.5% sera automatiquement appliquée à toutes les transactions.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};
