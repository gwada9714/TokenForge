import React from 'react';
import { Box, Typography } from '@mui/material';

interface AuditLogsProps {
  onError: (message: string) => void;
}

const AuditLogs: React.FC<AuditLogsProps> = () => {
  return (
    <Box>
      <Typography variant="h6">Audit Logs</Typography>
      <Typography>Coming soon...</Typography>
    </Box>
  );
};

export default AuditLogs;
