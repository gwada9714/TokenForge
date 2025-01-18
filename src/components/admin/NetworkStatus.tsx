import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

interface StatusIconProps {
  isValid: boolean;
  hasError?: boolean;
}

const StatusIcon: React.FC<StatusIconProps> = ({ isValid, hasError }) => {
  if (isValid) return <CheckCircleIcon color="success" />;
  if (hasError) return <ErrorIcon color="error" />;
  return <WarningIcon color="warning" />;
};

interface NetworkStatusProps {
  networkCheck: {
    isCorrectNetwork: boolean;
    requiredNetwork: string;
    networkName?: string;
  };
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ networkCheck }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <StatusIcon isValid={networkCheck.isCorrectNetwork} />
    <Typography>
      Connexion au réseau {networkCheck.requiredNetwork}
      {networkCheck.networkName && ` (actuellement sur ${networkCheck.networkName})`}
    </Typography>
  </Box>
);
