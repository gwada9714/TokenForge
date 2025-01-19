import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { SwapHoriz as SwapIcon } from '@mui/icons-material';
import { useNetworkManagement } from '../../hooks/useNetworkManagement';
import { Chain } from 'viem';
import { NetworkAlertDialog } from './NetworkAlertDialog';

interface NetworkStatusProps {
  preferredChain: Chain;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  preferredChain
}) => {
  const {
    isCorrectNetwork,
    currentChainId,
    switchToNetwork,
    isSupported,
    isSwitching,
    supportedNetworks
  } = useNetworkManagement(preferredChain);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleNetworkSwitch = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleNetworkSelect = async (chain: Chain) => {
    await switchToNetwork(chain);
    setDialogOpen(false);
  };

  // Obtenir le nom du réseau
  const getNetworkName = (chainId?: number) => {
    if (!chainId) return 'Non connecté';
    const network = supportedNetworks.find(n => n.id === chainId);
    return network?.name || 'Réseau inconnu';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={isSupported ? 'Réseau actuel' : 'Réseau non supporté'}>
        <Chip
          label={getNetworkName(currentChainId)}
          color={isCorrectNetwork ? 'success' : 'error'}
          variant="outlined"
          size="small"
        />
      </Tooltip>
      
      {!isCorrectNetwork && (
        <Tooltip title="Changer de réseau">
          <IconButton
            size="small"
            onClick={handleNetworkSwitch}
            disabled={isSwitching}
          >
            <SwapIcon />
          </IconButton>
        </Tooltip>
      )}

      <NetworkAlertDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onNetworkSelect={handleNetworkSelect}
        networks={supportedNetworks}
        currentNetwork={currentChainId}
      />
    </Box>
  );
};

export default NetworkStatus;
