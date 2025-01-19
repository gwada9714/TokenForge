import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { SwapHoriz as SwapIcon } from '@mui/icons-material';
import { useNetworkManagement } from '../../hooks/useNetworkManagement';
import { SUPPORTED_NETWORKS } from '../../config/networks';
import { NetworkAlertDialog } from './NetworkAlertDialog';

interface NetworkStatusProps {
  preferredNetwork?: typeof SUPPORTED_NETWORKS.SEPOLIA | typeof SUPPORTED_NETWORKS.MAINNET;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  preferredNetwork = SUPPORTED_NETWORKS.SEPOLIA 
}) => {
  const {
    isSupported,
    isSwitching,
    currentChainId,
    switchToNetwork,
    supportedNetworks
  } = useNetworkManagement(preferredNetwork);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetNetwork, setTargetNetwork] = useState<typeof SUPPORTED_NETWORKS.SEPOLIA | typeof SUPPORTED_NETWORKS.MAINNET>(
    preferredNetwork
  );

  // Obtenir le nom du réseau
  const getNetworkName = (chainId?: number) => {
    if (!chainId) return 'Non connecté';
    switch (chainId) {
      case supportedNetworks.MAINNET:
        return 'Ethereum Mainnet';
      case supportedNetworks.SEPOLIA:
        return 'Sepolia Testnet';
      default:
        return 'Réseau non supporté';
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = () => {
    if (isSwitching) return 'warning';
    if (!isSupported) return 'error';
    return 'success';
  };

  // Gérer le changement de réseau
  const handleNetworkSwitch = () => {
    if (!currentChainId || isSwitching) return;
    
    // Si on est sur Mainnet, passer sur Sepolia et vice versa
    const newTargetNetwork = currentChainId === supportedNetworks.MAINNET 
      ? supportedNetworks.SEPOLIA 
      : supportedNetworks.MAINNET;
    
    setTargetNetwork(newTargetNetwork);
    setDialogOpen(true);
  };

  // Gérer la confirmation du changement de réseau
  const handleConfirmNetworkSwitch = () => {
    switchToNetwork(targetNetwork);
    setDialogOpen(false);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={getNetworkName(currentChainId)}
          color={getStatusColor()}
          size="small"
          variant={isSupported ? 'filled' : 'outlined'}
        />
        <Tooltip title="Changer de réseau">
          <IconButton
            size="small"
            onClick={handleNetworkSwitch}
            disabled={isSwitching || !currentChainId}
          >
            <SwapIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <NetworkAlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmNetworkSwitch}
        targetNetwork={targetNetwork}
        isLoading={isSwitching}
      />
    </>
  );
};

export default NetworkStatus;
