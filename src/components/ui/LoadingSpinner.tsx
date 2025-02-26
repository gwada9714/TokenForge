import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export const LoadingSpinner: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to right, rgba(24, 32, 56, 0.95), rgba(30, 41, 67, 0.95))',
      }}
    >
      <CircularProgress 
        sx={{ 
          color: '#D97706',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }} 
      />
    </Box>
  );
};