import React from 'react';
import { Box, Typography } from '@mui/material';

interface AlertsManagementProps {
  onError: (message: string) => void;
}

const AlertsManagement: React.FC<AlertsManagementProps> = () => {
  return (
    <Box>
      <Typography variant="h6">Alerts Management</Typography>
      <Typography>Coming soon...</Typography>
    </Box>
  );
};

export default AlertsManagement;
