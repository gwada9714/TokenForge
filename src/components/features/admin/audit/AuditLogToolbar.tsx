import React from 'react';
import { Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

interface AuditLogToolbarProps {
  onExport: () => void;
  onPurge: () => void;
  disabled?: boolean;
}

export const AuditLogToolbar: React.FC<AuditLogToolbarProps> = ({
  onExport,
  onPurge,
  disabled = false,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={onExport}
        disabled={disabled}
      >
        Exporter
      </Button>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={onPurge}
        disabled={disabled}
      >
        Purger
      </Button>
    </Box>
  );
};

export default AuditLogToolbar;
