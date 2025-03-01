import React from 'react';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { useTokenForgeAuthContext } from '@/features/auth';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAutoConnect } from '@/hooks/useAutoConnect';
import { useSnackbar } from 'notistack';

export const ConnectWalletPage: React.FC = () => {
  const { wallet } = useTokenForgeAuthContext();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const from = (location.state as any)?.from?.pathname || '/';

  const { isAttempting } = useAutoConnect({
    enabled: true,
    onSuccess: () => {
      enqueueSnackbar('Wallet connecté avec succès', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar('Erreur lors de la connexion automatique', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  });

  if (wallet?.isConnected) {
    return <Navigate to={from} replace />;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h4" gutterBottom>
            Connectez votre Wallet
          </Typography>
          
          {isAttempting ? (
            <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Tentative de connexion automatique...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary" paragraph>
                Pour accéder à cette fonctionnalité, vous devez connecter votre wallet Ethereum.
                Cliquez sur le bouton ci-dessous pour vous connecter via MetaMask ou un autre wallet Web3.
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <ConnectButton />
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
