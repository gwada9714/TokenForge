import React from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import { TokenAdvancedConfig } from '../../types/tokens';
import { validateAddress } from '../../services/validation';

interface AdvancedTokenFormProps {
  config: TokenAdvancedConfig;
  onConfigChange: (config: TokenAdvancedConfig) => void;
}

type AccessControlType = 'none' | 'ownable' | 'roles';

export const AdvancedTokenForm: React.FC<AdvancedTokenFormProps> = ({
  config,
  onConfigChange
}) => {
  const handleSwitchChange = (field: keyof TokenAdvancedConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onConfigChange({
      ...config,
      [field]: event.target.checked
    });
  };

  const handleSelectChange = (field: keyof TokenAdvancedConfig) => (
    event: SelectChangeEvent<AccessControlType>
  ) => {
    onConfigChange({
      ...config,
      [field]: event.target.value
    });
  };

  const handleTextChange = (field: keyof TokenAdvancedConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    
    if (field === 'asset' && value && !validateAddress(value)) {
      return;
    }
    
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.burnable}
              onChange={handleSwitchChange('burnable')}
            />
          }
          label="Burnable"
        />
        <FormControlLabel
          control={
            <Switch
              checked={config.mintable}
              onChange={handleSwitchChange('mintable')}
            />
          }
          label="Mintable"
        />
        <FormControlLabel
          control={
            <Switch
              checked={config.pausable}
              onChange={handleSwitchChange('pausable')}
            />
          }
          label="Pausable"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.upgradeable}
              onChange={handleSwitchChange('upgradeable')}
            />
          }
          label="Upgradeable"
        />
        {config.upgradeable && (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={config.transparent}
                  onChange={handleSwitchChange('transparent')}
                />
              }
              label="Transparent"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={config.uups}
                  onChange={handleSwitchChange('uups')}
                />
              }
              label="UUPS"
            />
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.permit}
              onChange={handleSwitchChange('permit')}
            />
          }
          label="Permit"
        />
        <FormControlLabel
          control={
            <Switch
              checked={config.votes}
              onChange={handleSwitchChange('votes')}
            />
          }
          label="Votes"
        />
      </Box>

      <FormControl fullWidth>
        <InputLabel>Access Control</InputLabel>
        <Select<AccessControlType>
          value={config.accessControl as AccessControlType}
          onChange={handleSelectChange('accessControl')}
          label="Access Control"
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="ownable">Ownable</MenuItem>
          <MenuItem value="roles">Roles</MenuItem>
        </Select>
      </FormControl>

      {config.votes && (
        <FormControl fullWidth>
          <TextField
            label="Base URI"
            value={config.baseURI}
            onChange={handleTextChange('baseURI')}
            placeholder="https://..."
          />
        </FormControl>
      )}

      <FormControl fullWidth>
        <TextField
          label="Asset Address"
          value={config.asset}
          onChange={handleTextChange('asset')}
          placeholder="0x..."
          error={!!config.asset && !validateAddress(config.asset)}
          helperText={
            config.asset && !validateAddress(config.asset)
              ? 'Invalid address format'
              : ''
          }
        />
      </FormControl>

      <FormControl fullWidth>
        <TextField
          label="Max Supply"
          value={config.maxSupply}
          onChange={handleTextChange('maxSupply')}
          type="number"
          placeholder="0"
        />
      </FormControl>

      <FormControl fullWidth>
        <TextField
          label="Deposit Limit"
          value={config.depositLimit}
          onChange={handleTextChange('depositLimit')}
          type="number"
          placeholder="0"
        />
      </FormControl>
    </Box>
  );
};
