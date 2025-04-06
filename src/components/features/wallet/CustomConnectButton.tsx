import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CircularProgress,
  Box,
  Alert,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { SwapHoriz as SwapIcon } from "@mui/icons-material";
import { useWeb3 } from "../../contexts/Web3Context";

export const CustomConnectButton: React.FC = () => {
  const {
    isLoading,
    network: {
      isSupported,
      currentNetwork,
      isSwitching,
      switchToTestnet,
      switchToMainnet,
      isMainnet,
      isTestnet,
    },
    hasError,
    errorMessage,
    retryConnection,
  } = useWeb3();

  // Afficher un loader pendant la connexion ou le changement de réseau
  if (isLoading || isSwitching) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>
          {isSwitching ? "Changement de réseau..." : "Connexion en cours..."}
        </Typography>
      </Box>
    );
  }

  // Afficher une erreur avec option de réessayer
  if (hasError) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retryConnection}>
              Réessayer
            </Button>
          }
        >
          {errorMessage || "Erreur de connexion"}
        </Alert>
      </Box>
    );
  }

  // Afficher le bouton de connexion standard
  return (
    <Box>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <Box
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      variant="contained"
                      color="primary"
                    >
                      Se connecter
                    </Button>
                  );
                }

                return (
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={openChainModal}
                      variant="outlined"
                      startIcon={<SwapIcon />}
                    >
                      {chain.name}
                    </Button>
                    <Button onClick={openAccountModal} variant="contained">
                      {account.displayName}
                    </Button>
                  </Stack>
                );
              })()}
            </Box>
          );
        }}
      </ConnectButton.Custom>
    </Box>
  );
};

export default CustomConnectButton;
