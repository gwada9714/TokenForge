import React from "react";
import {
  Typography,
  Button,
  Box,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { useWeb3 } from "../providers";
import { useTokenList } from "../hooks/useTokenList";
import { formatValue } from "../utils/web3Adapters";

const TokenList: React.FC = () => {
  const { isConnected, connect, isInitializing } = useWeb3();
  const { tokens, isLoading, error, refresh } = useTokenList();

  if (isInitializing) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 2,
        width: "100%",
        maxWidth: "lg",
        margin: "0 auto",
      }}
    >
      <Stack spacing={4} sx={{ width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography component="h1" variant="h4" sx={{ fontWeight: "bold" }}>
            Mes Tokens
          </Typography>
          {isConnected && (
            <Button variant="outlined" onClick={refresh} disabled={isLoading}>
              Actualiser
            </Button>
          )}
        </Box>

        {error && (
          <Box sx={{ bgcolor: "error.light", p: 2, borderRadius: 1 }}>
            <Typography color="error.main" variant="body1">
              {error}
            </Typography>
          </Box>
        )}

        {!isConnected && (
          <Box textAlign="center" py={4}>
            <Typography
              variant="body1"
              color="text.secondary"
              gutterBottom
              mb={2}
            >
              Connectez votre wallet pour voir vos tokens
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => connect()}
            >
              Connecter mon wallet
            </Button>
          </Box>
        )}

        {isConnected && isLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {isConnected && !isLoading && tokens.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              Vous n'avez pas encore créé de tokens
            </Typography>
          </Box>
        )}

        {isConnected && !isLoading && tokens.length > 0 && (
          <Grid container spacing={3}>
            {tokens.map((token) => (
              <Grid item xs={12} sm={6} md={4} key={token.address}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {token.name} ({token.symbol})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Adresse: {token.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Decimals: {token.decimals}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supply: {formatValue(token.totalSupply)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

export default TokenList;
