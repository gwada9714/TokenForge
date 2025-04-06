import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { fetchUserTokens, UserToken } from "@/store/slices/userTokensSlice";
import { TokenCard } from "@/components/features/token";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import { useAccount } from "wagmi";

const MyTokens: React.FC = () => {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { tokens, loading, error } = useAppSelector(
    (state) => state.userTokens
  );

  useEffect(() => {
    if (address) {
      dispatch(fetchUserTokens(address));
    }
  }, [address, dispatch]);

  const handleTokenAction = (tokenAddress: string) => {
    // Gérer les actions sur le token (ex: redirection vers la page de détails)
    // console.log('Token action:', tokenAddress);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box mt={4}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!tokens.length) {
    return (
      <Container maxWidth="lg">
        <Box mt={4}>
          <Typography variant="h6" align="center">
            Vous n'avez pas encore de tokens
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Mes Tokens
        </Typography>
        <Grid container spacing={3}>
          {tokens.map((token: UserToken) => (
            <Grid item xs={12} sm={6} md={4} key={token.address}>
              <TokenCard
                token={{
                  address: token.address,
                  symbol: token.symbol,
                  balance: token.balance,
                }}
                onAction={handleTokenAction}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default MyTokens;
