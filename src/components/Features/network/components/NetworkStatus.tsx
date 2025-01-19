import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNetworkManagement } from '../hooks/useNetworkManagement';

interface NetworkStatusProps {
  showRefresh?: boolean;
  compact?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  showRefresh = false,
  compact = false,
}) => {
  const {
    currentNetwork,
    isSwitching,
    networkError,
  } = useNetworkManagement();

  const getStatusColor = () => {
    if (networkError) return 'error';
    if (isSwitching) return 'warning';
    if (currentNetwork?.isTestnet) return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (networkError) return 'Network Error';
    if (isSwitching) return 'Switching Network';
    if (!currentNetwork) return 'Not Connected';
    return currentNetwork.name;
  };

  if (compact) {
    return (
      <Tooltip title={networkError || currentNetwork?.name || 'Not Connected'}>
        <Chip
          size="small"
          label={currentNetwork?.currency.symbol || 'N/A'}
          color={getStatusColor()}
          icon={isSwitching ? <CircularProgress size={16} /> : undefined}
        />
      </Tooltip>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Chip
        label={getStatusText()}
        color={getStatusColor()}
        icon={isSwitching ? <CircularProgress size={16} /> : undefined}
      />
      {currentNetwork && !networkError && (
        <Typography variant="body2" color="textSecondary">
          {currentNetwork.currency.symbol}
        </Typography>
      )}
      {showRefresh && (
        <Tooltip title="Refresh Network Status">
          <IconButton
            size="small"
            onClick={() => window.location.reload()}
            disabled={isSwitching}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default React.memo(NetworkStatus);
