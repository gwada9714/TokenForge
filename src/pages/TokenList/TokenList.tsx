import React, { useEffect } from "react";
import { Typography, Button, Container } from "@mui/material";
import { useWeb3 } from "../../providers/Web3Provider";
import { useTokens } from "../../contexts/TokenContext";
import { TokenListView } from "./TokenListView";

export const TokenList: React.FC = () => {
  const { isConnected, connect } = useWeb3();
  const { tokens, isLoading, error, loadTokens } = useTokens();

  useEffect(() => {
    if (isConnected) {
      loadTokens();
    }
  }, [isConnected, loadTokens]);

  if (!isConnected) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Mes Tokens
        </Typography>
        <Button variant="contained" onClick={connect} sx={{ mt: 2 }}>
          Connecter Wallet
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mes Tokens
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <TokenListView tokens={tokens} isLoading={isLoading} />
    </Container>
  );
};
