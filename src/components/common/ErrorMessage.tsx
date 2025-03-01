import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';

interface ErrorMessageProps {
  message: string;
  title?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Erreur',
  severity = 'error',
  onRetry,
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity={severity}
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Réessayer
            </Button>
          )
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
