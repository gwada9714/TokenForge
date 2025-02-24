import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RefreshIcon from '@mui/icons-material/Refresh';

interface AuditLogToolbarProps {
  onExport: () => void;
  onPurge: () => void;
  onRefresh?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const AuditLogToolbar: React.FC<AuditLogToolbarProps> = ({
  onExport,
  onPurge,
  onRefresh,
  isLoading,
  disabled = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        mb: 2,
      }}
    >
      <Typography variant="h6" component="h2">
        Logs d'Audit
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {onRefresh && (
          <Tooltip title="Rafraîchir les logs">
            <span>
              <LoadingButton
                onClick={onRefresh}
                loading={isLoading}
                disabled={isLoading}
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<RefreshIcon />}
              >
                Rafraîchir
              </LoadingButton>
            </span>
          </Tooltip>
        )}

        <Tooltip title={disabled ? 'Aucun log disponible' : 'Exporter les logs au format CSV'}>
          <span>
            <LoadingButton
              onClick={onExport}
              loading={isLoading}
              disabled={disabled || isLoading}
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<DownloadIcon />}
            >
              Exporter
            </LoadingButton>
          </span>
        </Tooltip>

        <Tooltip title={disabled ? 'Aucun log à supprimer' : 'Supprimer tous les logs'}>
          <span>
            <LoadingButton
              onClick={onPurge}
              loading={isLoading}
              disabled={disabled || isLoading}
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteSweepIcon />}
            >
              Purger
            </LoadingButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default React.memo(AuditLogToolbar);
