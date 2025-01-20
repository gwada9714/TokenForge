import React from 'react';
import { Box } from '@mui/material';
import { AuthStatus } from '../types';
import { AuthError } from '../errors/AuthError';
import { AuthProgress } from './ui/AuthProgress';
import { AuthErrorDisplay } from './ui/AuthError';
import { AuthStatusBar } from './ui/AuthStatusBar';

interface AuthenticationUIProps {
  status: AuthStatus;
  error?: AuthError | null;
  walletAddress?: string | null;
  networkName?: string;
  onRetry?: () => void;
  onDismissError?: () => void;
}

export const AuthenticationUI: React.FC<AuthenticationUIProps> = ({
  status,
  error,
  walletAddress,
  networkName,
  onRetry,
  onDismissError
}) => {
  return (
    <Box>
      <AuthStatusBar 
        status={status}
        walletAddress={walletAddress}
        networkName={networkName}
      />
      
      {error && (
        <AuthErrorDisplay
          error={error}
          onRetry={onRetry}
          onDismiss={onDismissError}
        />
      )}
      
      <AuthProgress status={status} />
    </Box>
  );
};
