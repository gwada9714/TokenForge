import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';

export const WalletConnection: React.FC = () => {
  const { walletState } = useTokenForgeAuth();

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Connect Your Wallet
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Please connect your wallet to continue
      </Typography>
      <Button
        variant="contained"
        color="primary"
        disabled={walletState.isConnected}
      >
        Connect Wallet
      </Button>
    </Box>
  );
};
