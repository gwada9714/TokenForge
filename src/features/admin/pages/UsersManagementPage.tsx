import React from 'react';
import { Box, Typography } from '@mui/material';

export const UsersManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des Utilisateurs
      </Typography>
      {/* Add user management content here */}
    </Box>
  );
};
