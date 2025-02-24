import React from 'react';
import { Box, Typography } from '@mui/material';

export const TokensManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des Tokens
      </Typography>
      {/* Add token management content here */}
    </Box>
  );
};
