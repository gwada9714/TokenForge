import React, { useState } from "react";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { SwapHoriz as SwapIcon } from "@mui/icons-material";
import { useNetworkManagement } from "../../hooks/useNetworkManagement";
import { Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { NetworkAlertDialog } from "./NetworkAlertDialog";

interface NetworkStatusProps {
  preferredChain?: Chain;
  compact?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  preferredChain,
  compact = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const defaultNetworks = [sepolia, mainnet];

  const {
    isCorrectNetwork,
    currentChainId,
    switchToNetwork,
    isSupported,
    isSwitching,
    supportedNetworks,
  } = useNetworkManagement(preferredChain || defaultNetworks[0]);

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

  const currentNetwork = supportedNetworks.find(
    (network) => network.id === currentChainId
  );

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          label={currentNetwork?.name || "Unknown Network"}
          color={
            isSupported ? (isCorrectNetwork ? "success" : "warning") : "error"
          }
          size={compact ? "small" : "medium"}
          sx={{ minWidth: compact ? 100 : 140 }}
        />
        {!isCorrectNetwork && (
          <Tooltip title="Switch Network">
            <IconButton
              size={compact ? "small" : "medium"}
              onClick={handleNetworkSwitch}
              disabled={isSwitching}
            >
              <SwapIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <NetworkAlertDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        networks={supportedNetworks}
        onNetworkSelect={handleNetworkSelect}
        currentNetwork={currentChainId}
      />
    </>
  );
};

export default NetworkStatus;
