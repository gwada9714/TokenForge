import React from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { useAuthManager } from '../hooks/useAuthManager';
import { SupportedChainId } from '../hooks/useNetworkManagement';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 2),
  textTransform: 'none',
  minWidth: 140,
}));

const NetworkIcon = styled('div')<{ color: string }>(({ color }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: color,
  marginRight: 8,
}));

interface NetworkSelectorProps {
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  variant = 'outlined',
  size = 'medium',
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const {
    chainId,
    isChangingNetwork,
    supportedNetworks,
    switchNetwork,
  } = useAuthManager();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNetworkSelect = async (targetChainId: SupportedChainId) => {
    handleClose();
    if (chainId !== targetChainId) {
      await switchNetwork(targetChainId);
    }
  };

  const getNetworkColor = (networkChainId: number): string => {
    switch (networkChainId) {
      case 1: // Mainnet
        return '#29B6AF';
      case 11155111: // Sepolia
        return '#FF4A8D';
      default:
        return '#666666';
    }
  };

  const getNetworkName = (networkChainId: number): string => {
    return supportedNetworks[networkChainId as SupportedChainId].chainName;
  };

  const currentNetworkName = chainId ? getNetworkName(chainId) : 'Select Network';

  return (
    <>
      <StyledButton
        variant={variant}
        size={size}
        onClick={handleClick}
        endIcon={isChangingNetwork ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
        disabled={isChangingNetwork}
      >
        {chainId && (
          <NetworkIcon color={getNetworkColor(chainId)} />
        )}
        {currentNetworkName}
      </StyledButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {Object.keys(supportedNetworks).map((networkChainId) => {
          const chainIdNumber = Number(networkChainId);
          return (
            <MenuItem
              key={networkChainId}
              onClick={() => handleNetworkSelect(chainIdNumber as SupportedChainId)}
              selected={chainId === chainIdNumber}
            >
              <ListItemIcon>
                <NetworkIcon color={getNetworkColor(chainIdNumber)} />
              </ListItemIcon>
              <ListItemText>
                {getNetworkName(chainIdNumber)}
              </ListItemText>
              {chainId === chainIdNumber && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
