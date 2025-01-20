import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { AuthStatus } from '../../types';
import { messages } from '../../constants/messages';
import { AuthProgress } from './AuthProgress';

interface AuthStatusBarProps {
  status: AuthStatus;
  walletAddress?: string | null;
  networkName?: string;
}

export const AuthStatusBar: React.FC<AuthStatusBarProps> = ({
  status,
  walletAddress,
  networkName
}) => {
  const statusMessage = messages.fr.status[status];
  const isAuthenticated = status === 'authenticated';
  const isError = status === 'error';
  const isLoading = status === 'loading' || status === 'verifying';

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      gap={2} 
      p={1} 
      bgcolor="background.paper"
      borderRadius={1}
      boxShadow={1}
    >
      {isLoading ? (
        <AuthProgress status={status} showText={false} />
      ) : (
        <Chip
          icon={isAuthenticated ? <CheckCircleIcon /> : <ErrorIcon />}
          label={statusMessage}
          color={isAuthenticated ? 'success' : isError ? 'error' : 'default'}
          size="small"
        />
      )}

      {isAuthenticated && walletAddress && (
        <>
          <Typography variant="body2" color="text.secondary">
            Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </Typography>
          {networkName && (
            <Chip
              label={networkName}
              size="small"
              variant="outlined"
            />
          )}
        </>
      )}
    </Box>
  );
};
