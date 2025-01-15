import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingComponent: React.FC = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress size={24} />
      <Typography sx={{ ml: 2 }}>Loading...</Typography>
    </Box>
  );
};

export default LoadingComponent;
