import React from 'react';
import {
  Alert,
  AlertTitle,
  Snackbar,
  Typography,
  Box,
} from '@mui/material';
import { AuthError } from '../errors/AuthError';

interface AuthFeedbackProps {
  error: Error | null;
  onClose: () => void;
}

export const AuthFeedback: React.FC<AuthFeedbackProps> = ({
  error,
  onClose,
}) => {
  if (!error) return null;

  const isAuthError = error instanceof AuthError;
  const errorCode = isAuthError ? error.code : 'UNKNOWN';
  
  const getErrorTitle = () => {
    switch (errorCode) {
      case 'AUTH_001':
        return 'Wallet Not Found';
      case 'AUTH_002':
        return 'Network Error';
      case 'AUTH_003':
        return 'Signature Error';
      case 'AUTH_004':
        return 'Session Expired';
      case 'AUTH_008':
        return 'Wallet Disconnected';
      case 'AUTH_009':
        return 'Connection Error';
      case 'NETWORK_001':
        return 'Network Not Available';
      case 'NETWORK_002':
        return 'Network Switch Failed';
      default:
        return 'Authentication Error';
    }
  };

  const getErrorSeverity = () => {
    switch (errorCode) {
      case 'AUTH_001':
      case 'AUTH_002':
        return 'warning';
      case 'AUTH_008':
        return 'info';
      default:
        return 'error';
    }
  };

  const getErrorAction = () => {
    switch (errorCode) {
      case 'AUTH_001':
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              Install MetaMask or another Web3 wallet to continue.
            </Typography>
          </Box>
        );
      case 'AUTH_002':
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              Please switch to a supported network in your wallet.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={getErrorSeverity()}
        onClose={onClose}
        variant="filled"
        sx={{ width: '100%' }}
      >
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        {error.message}
        {getErrorAction()}
      </Alert>
    </Snackbar>
  );
};
