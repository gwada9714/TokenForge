import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { useNetworkManagement } from '../hooks/useNetworkManagement';
import { NetworkAlertDialog } from './NetworkAlertDialog';

export const NetworkSelector: React.FC = () => {
  const {
    currentNetwork,
    availableNetworks,
    switchNetwork,
    isSwitching,
    networkError,
    clearNetworkError,
  } = useNetworkManagement();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showError, setShowError] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNetworkSelect = async (chainId: number) => {
    handleClose();
    try {
      await switchNetwork(chainId);
    } catch (error) {
      setShowError(true);
    }
  };

  const handleErrorClose = () => {
    setShowError(false);
    clearNetworkError();
  };

  return (
    <Box>
      <Button
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
        disabled={isSwitching}
        sx={{
          textTransform: 'none',
          minWidth: 120,
        }}
      >
        {isSwitching ? (
          <CircularProgress size={20} />
        ) : (
          <Typography>
            {currentNetwork?.name || 'Select Network'}
          </Typography>
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {availableNetworks.map((network) => (
          <MenuItem
            key={network.chainId}
            onClick={() => handleNetworkSelect(network.chainId)}
            selected={currentNetwork?.chainId === network.chainId}
            disabled={isSwitching}
          >
            <ListItemIcon>
              {currentNetwork?.chainId === network.chainId && (
                <CheckIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={network.name}
              secondary={network.isTestnet ? 'Testnet' : 'Mainnet'}
            />
          </MenuItem>
        ))}
      </Menu>

      <NetworkAlertDialog
        open={showError}
        error={networkError}
        onClose={handleErrorClose}
      />
    </Box>
  );
};

export default React.memo(NetworkSelector);
