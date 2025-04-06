import React from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useTokenForgeAuthContext } from "../../features/auth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import { mainnet, sepolia } from "../../config/chains";

export const WrongNetworkPage: React.FC = () => {
  const { isCorrectNetwork } = useTokenForgeAuthContext();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  if (isCorrectNetwork) {
    return <Navigate to={from} replace />;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
          <SyncProblemIcon
            sx={{ fontSize: 64, mb: 2, color: "warning.main" }}
          />
          <Typography component="h1" variant="h4" gutterBottom>
            Wrong Network
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please switch to one of the supported networks:
          </Typography>
          <Typography variant="body1" paragraph>
            • Ethereum Mainnet (ChainID: {mainnet.id})
            <br />• Sepolia Testnet (ChainID: {sepolia.id})
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <ConnectButton />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
