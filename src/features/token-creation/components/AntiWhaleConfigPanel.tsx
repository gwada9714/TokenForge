import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
  Tooltip,
  IconButton,
  Grid,
  Paper
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { AntiWhaleConfig } from './TokenConfigurationForm';

interface AntiWhaleConfigPanelProps {
  config: AntiWhaleConfig;
  onChange: (config: AntiWhaleConfig) => void;
}

export const AntiWhaleConfigPanel: React.FC<AntiWhaleConfigPanelProps> = ({
  config,
  onChange
}) => {
  const { checkFeature } = useSubscription();
  const hasAdvancedFeatures = checkFeature('hasAdvancedFeatures');

  const handleToggle = () => {
    onChange({
      ...config,
      enabled: !config.enabled
    });
  };

  const handleMaxTransactionChange = (_: Event, value: number | number[]) => {
    onChange({
      ...config,
      maxTransactionPercentage: value as number
    });
  };

  const handleMaxWalletChange = (_: Event, value: number | number[]) => {
    onChange({
      ...config,
      maxWalletPercentage: value as number
    });
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Protection Anti-Whale</Typography>
        <Tooltip title="La protection Anti-Whale limite la quantité de tokens qu'un utilisateur peut acheter ou détenir, empêchant ainsi la concentration des tokens dans quelques portefeuilles.">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={config.enabled}
            onChange={handleToggle}
            disabled={!hasAdvancedFeatures}
          />
        }
        label="Activer la protection Anti-Whale"
      />

      {!hasAdvancedFeatures && (
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          La protection Anti-Whale est disponible uniquement avec l'abonnement Maître Forgeron.
        </Alert>
      )}

      {config.enabled && hasAdvancedFeatures && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography gutterBottom>
              Limite de transaction maximum (% du supply total)
            </Typography>
            <Slider
              value={config.maxTransactionPercentage}
              onChange={handleMaxTransactionChange}
              min={0.1}
              max={5}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>
              Limite de portefeuille maximum (% du supply total)
            </Typography>
            <Slider
              value={config.maxWalletPercentage}
              onChange={handleMaxWalletChange}
              min={0.5}
              max={10}
              step={0.5}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              Ces limitations empêchent les manipulations de marché et favorisent une distribution plus équitable des tokens.
            </Alert>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};
