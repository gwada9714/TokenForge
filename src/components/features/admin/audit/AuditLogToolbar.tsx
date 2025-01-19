import React from 'react';
import { Box, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

interface AuditLogToolbarProps {
  onExport: () => void;
  onPurge: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const AuditLogToolbar: React.FC<AuditLogToolbarProps> = ({
  onExport,
  onPurge,
  isLoading,
  disabled = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      <Tooltip title={disabled || isLoading ? 'Aucun log disponible' : 'Exporter les logs au format CSV'}>
        <span>
          <LoadingButton
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            disabled={disabled || isLoading}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Exporter
          </LoadingButton>
        </span>
      </Tooltip>
      <Tooltip title={disabled || isLoading ? 'Aucun log à purger' : 'Supprimer tous les logs'}>
        <span>
          <LoadingButton
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onPurge}
            disabled={disabled || isLoading}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Purger
          </LoadingButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default AuditLogToolbar;
