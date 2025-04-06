import React from "react";
import { Box, Paper, Typography, Button, Container } from "@mui/material";
import { useTokenForgeAuth } from "@/hooks/useAuth";

export const ConnectWalletPage: React.FC = () => {
  const { connectWallet } = useTokenForgeAuth();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Connecter votre wallet
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Pour continuer, vous devez connecter votre wallet Ethereum.
          </Typography>
          <Button variant="contained" onClick={connectWallet} sx={{ mt: 2 }}>
            Connecter le wallet
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
