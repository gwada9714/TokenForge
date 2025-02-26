import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40,
  color = 'primary'
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress 
        size={size}
        color={color}
      />
    </Box>
  );
}; 