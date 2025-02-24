import React from 'react';
import { Box, Typography } from '@mui/material';

export const TokenListPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Liste des Tokens
      </Typography>
      {/* Add token list content here */}
    </Box>
  );
};
