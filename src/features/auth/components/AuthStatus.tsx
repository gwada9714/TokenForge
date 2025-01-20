import React from 'react';
import { CircularProgress, Alert, AlertTitle, Box } from '@mui/material';
import { AuthStatus as AuthStatusType } from '../types';
import { authMessages } from '../locales/fr';
import { AuthError } from '../errors/AuthError';

interface AuthStatusProps {
  status: AuthStatusType;
  error?: AuthError | null;
}

const getStatusColor = (status: AuthStatusType): 'success' | 'info' | 'error' | undefined => {
  switch (status) {
    case 'authenticated':
      return 'success';
    case 'loading':
    case 'verifying':
      return 'info';
    case 'error':
      return 'error';
    default:
      return undefined;
  }
};

export const AuthStatus: React.FC<AuthStatusProps> = ({ status, error }) => {
  const statusMessage = authMessages.status[status];
  const statusColor = getStatusColor(status);
  const isLoading = status === 'loading' || status === 'verifying';

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2, width: '100%' }}
      >
        <AlertTitle>Erreur</AlertTitle>
        {authMessages.errors[error.code] || error.message}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress size={20} />
        <span>{statusMessage}</span>
      </Box>
    );
  }

  if (statusColor) {
    return (
      <Alert severity={statusColor} sx={{ mb: 2, width: '100%' }}>
        {statusMessage}
      </Alert>
    );
  }

  return null;
};
