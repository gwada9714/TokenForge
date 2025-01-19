import React from 'react';
import { Box, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
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
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      <Tooltip title={disabled ? 'Aucun log disponible' : 'Exporter les logs au format CSV'}>
        <span>
          <LoadingButton
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            disabled={disabled}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Exporter
          </LoadingButton>
        </span>
      </Tooltip>
      <Tooltip title={disabled ? 'Aucun log à purger' : 'Supprimer tous les logs'}>
        <span>
          <LoadingButton
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onPurge}
            disabled={disabled}
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
