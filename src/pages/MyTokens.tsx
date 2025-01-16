import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { fetchUserTokens } from '@/store/slices/userTokensSlice';
import TokenCard from '@/components/TokenCard/TokenCard';
import { Container, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { useAccount } from 'wagmi';

const MyTokens: React.FC = () => {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { tokens, loading, error } = useAppSelector((state) => state.userTokens);

  useEffect(() => {
    if (address) {
      dispatch(fetchUserTokens(address));
    }
  }, [address, dispatch]);

  const handleTokenAction = (tokenAddress: string) => {
    // Gérer les actions sur le token (ex: redirection vers la page de détails)
    console.log('Token action:', tokenAddress);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box className="flex justify-center items-center min-h-[400px]">
          <CircularProgress className="text-secondary-main" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box className="text-center py-12">
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom className="font-heading font-bold text-primary-main">
        Mes Tokens
      </Typography>
      
      {!address ? (
        <Box className="text-center py-12">
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Connectez votre portefeuille pour voir vos tokens
          </Typography>
        </Box>
      ) : tokens.length === 0 ? (
        <Box className="text-center py-12">
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Vous n'avez pas encore de tokens
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Commencez par créer votre premier token en utilisant notre assistant de création
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {tokens.map((token) => (
            <Grid item xs={12} sm={6} md={4} key={token.address}>
              <TokenCard token={token} onAction={handleTokenAction} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyTokens;
