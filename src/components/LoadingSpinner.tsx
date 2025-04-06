import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  fullScreen?: boolean;
  minHeight?: string | number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40,
  color = 'primary',
  fullScreen = true,
  minHeight = '100vh'
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={fullScreen ? minHeight : '200px'}
      width="100%"
      p={2}
    >
      <CircularProgress 
        size={size}
        color={color}
      />
    </Box>
  );
};