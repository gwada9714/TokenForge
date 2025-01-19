import React from 'react';
import { Box, Typography } from '@mui/material';

const AdminLogs: React.FC = () => {
  return (
    <Box p={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        Journaux d'Activité
      </Typography>
      {/* Add logs content */}
    </Box>
  );
};

export default AdminLogs;
