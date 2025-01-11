import React from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
  IconButton,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { TokenBaseConfig } from '../../types/tokens';

interface BasicTokenFormProps {
  config: TokenBaseConfig;
  onConfigChange: (config: TokenBaseConfig) => void;
  disabled?: boolean;
}

export const BasicTokenForm: React.FC<BasicTokenFormProps> = ({
  config,
  onConfigChange,
  disabled = false,
}) => {
  const handleChange = (field: keyof TokenBaseConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    let parsedValue: string | number = value;

    // Convertir les champs numériques
    if (field === 'decimals' || field === 'initialSupply') {
      parsedValue = value === '' ? 0 : Number(value);
      
      // Valider les décimales (0-18)
      if (field === 'decimals' && typeof parsedValue === 'number') {
        parsedValue = Math.max(0, Math.min(18, parsedValue));
      }
    }

    onConfigChange({
      ...config,
      [field]: parsedValue,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Token Information
      </Typography>

      <Box display="grid" gap={3}>
        <TextField
          fullWidth
          label="Token Name"
          value={config.name}
          onChange={handleChange('name')}
          disabled={disabled}
          placeholder="e.g., My Token"
          helperText="The full name of your token"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Choose a meaningful name that represents your token's purpose">
                  <IconButton edge="end" size="small">
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Token Symbol"
          value={config.symbol}
          onChange={handleChange('symbol')}
          disabled={disabled}
          placeholder="e.g., MTK"
          helperText="A short identifier for your token (2-5 characters recommended)"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="A unique symbol for your token, typically 2-5 characters">
                  <IconButton edge="end" size="small">
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          type="number"
          label="Decimals"
          value={config.decimals}
          onChange={handleChange('decimals')}
          disabled={disabled}
          inputProps={{ min: 0, max: 18 }}
          helperText="Number of decimal places (0-18, 18 recommended for compatibility)"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="The number of decimal places your token will support. 18 is the standard for most tokens.">
                  <IconButton edge="end" size="small">
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          type="number"
          label="Initial Supply"
          value={config.initialSupply}
          onChange={handleChange('initialSupply')}
          disabled={disabled}
          inputProps={{ min: 0 }}
          helperText="The initial amount of tokens to create"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="The total number of tokens that will be created initially. This can be increased later if the token is mintable.">
                  <IconButton edge="end" size="small">
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
};
