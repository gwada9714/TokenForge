import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { AuthError } from '../../errors/AuthError';
import { messages } from '../../constants/messages';

interface AuthErrorProps {
  error: AuthError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const AuthErrorDisplay: React.FC<AuthErrorProps> = ({ 
  error, 
  onRetry, 
  onDismiss 
}) => {
  const errorMessage = messages.fr.errors[error.code] || error.message;

  return (
    <Alert 
      severity="error"
      sx={{ mb: 2 }}
      action={
        <Box>
          {onRetry && (
            <Button 
              color="inherit" 
              size="small" 
              onClick={onRetry}
              sx={{ mr: 1 }}
            >
              {messages.fr.actions.retry}
            </Button>
          )}
          {onDismiss && (
            <Button 
              color="inherit" 
              size="small" 
              onClick={onDismiss}
            >
              {messages.fr.actions.cancel}
            </Button>
          )}
        </Box>
      }
    >
      <AlertTitle>Erreur</AlertTitle>
      {errorMessage}
    </Alert>
  );
};
