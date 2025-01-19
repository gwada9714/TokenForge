import React from 'react';
import { Button, Stack } from '@mui/material';
import { useTokenForgeAuthContext } from '../context/TokenForgeAuthProvider';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const AuthButtons: React.FC = () => {
  const { isAuthenticated, logout } = useTokenForgeAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Stack direction="row" spacing={2}>
      {isAuthenticated ? (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          href="/login"
        >
          Sign In
        </Button>
      )}
      <ConnectButton />
    </Stack>
  );
};
