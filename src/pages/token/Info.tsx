import React from 'react';
import { Box, Typography } from '@mui/material';

const TokenInfo: React.FC = () => {
  return (
    <Box p={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        Informations Token
      </Typography>
      {/* Add token info content */}
    </Box>
  );
};

export default TokenInfo;
