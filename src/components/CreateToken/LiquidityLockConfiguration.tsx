import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  Tooltip,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LiquidityLock } from '@/types/tokenFeatures';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';

interface LiquidityLockConfigurationProps {
  lockConfig: LiquidityLock;
  onChange: (config: LiquidityLock) => void;
  disabled?: boolean;
}

const MIN_LOCK_DURATION = 30 * 24 * 60 * 60; // 30 jours en secondes
const RECOMMENDED_LOCK_DURATION = 180 * 24 * 60 * 60; // 180 jours en secondes

const dexOptions = [
  { value: 'uniswap', label: 'Uniswap V2' },
  { value: 'pancakeswap', label: 'PancakeSwap' },
  { value: 'quickswap', label: 'QuickSwap' },
  { value: 'traderjoe', label: 'Trader Joe' },
];

export const LiquidityLockConfiguration: React.FC<LiquidityLockConfigurationProps> = ({
  lockConfig,
  onChange,
  disabled = false,
}) => {
  const handleChange = (field: keyof LiquidityLock, value: any) => {
    const newConfig = { ...lockConfig, [field]: value };

    // Calculer la date de déverrouillage basée sur la durée
    if (field === 'duration') {
      const unlockDate = new Date();
      unlockDate.setSeconds(unlockDate.getSeconds() + value);
      newConfig.unlockDate = unlockDate;
    }

    // Calculer la durée basée sur la date de déverrouillage
    if (field === 'unlockDate') {
      const now = new Date();
      newConfig.duration = Math.floor((value.getTime() - now.getTime()) / 1000);
    }

    onChange(newConfig);
  };

  const isLockDurationTooShort = lockConfig.duration < MIN_LOCK_DURATION;
  const isLockDurationRecommended = lockConfig.duration >= RECOMMENDED_LOCK_DURATION;

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <LockIcon color="primary" />
          <Typography variant="h6">Verrouillage de Liquidité</Typography>
          <Tooltip title="Le verrouillage de liquidité protège les investisseurs en garantissant que la liquidité du token ne peut pas être retirée pendant une période définie">
            <InfoIcon color="info" fontSize="small" />
          </Tooltip>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={lockConfig.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              disabled={disabled}
            />
          }
          label="Activer le verrouillage de liquidité"
        />

        {lockConfig.enabled && (
          <Box mt={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Montant à verrouiller (%)
                  </Typography>
                  <TextField
                    type="number"
                    value={lockConfig.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    disabled={disabled}
                    size="small"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    DEX
                  </Typography>
                  <Select
                    value={lockConfig.dex}
                    onChange={(e) => handleChange('dex', e.target.value)}
                    disabled={disabled}
                    size="small"
                  >
                    {dexOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Durée du verrouillage
                  </Typography>
                  <Select
                    value={lockConfig.duration}
                    onChange={(e) => handleChange('duration', Number(e.target.value))}
                    disabled={disabled}
                    size="small"
                  >
                    <MenuItem value={30 * 24 * 60 * 60}>30 jours</MenuItem>
                    <MenuItem value={90 * 24 * 60 * 60}>90 jours</MenuItem>
                    <MenuItem value={180 * 24 * 60 * 60}>180 jours</MenuItem>
                    <MenuItem value={365 * 24 * 60 * 60}>1 an</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Date de déverrouillage
                  </Typography>
                  <DateTimePicker
                    value={lockConfig.unlockDate}
                    onChange={(date) => handleChange('unlockDate', date)}
                    disabled={disabled}
                    minDateTime={new Date(Date.now() + MIN_LOCK_DURATION * 1000)}
                  />
                </FormControl>
              </Grid>

              {/* Warnings et Recommandations */}
              <Grid item xs={12}>
                {isLockDurationTooShort && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    La durée de verrouillage doit être d'au moins 30 jours.
                  </Alert>
                )}
                
                {!isLockDurationRecommended && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Une durée de verrouillage d'au moins 180 jours est recommandée pour établir la confiance.
                  </Alert>
                )}

                <Alert severity="info">
                  Le verrouillage de liquidité est irréversible et ne pourra pas être modifié une fois le token déployé.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
