import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { useTokenForgeAuthContext } from '../../features/auth';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const ConnectWalletPage: React.FC = () => {
  const { isConnected } = useTokenForgeAuthContext();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  if (isConnected) {
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
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            To access this feature, you need to connect your Ethereum wallet.
            Click the button below to connect using MetaMask or another Web3 wallet.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <ConnectButton />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
