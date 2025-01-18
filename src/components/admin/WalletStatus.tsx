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

interface WalletStatusProps {
  walletCheck: {
    isConnected: boolean;
    currentAddress?: string;
  };
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ walletCheck }) => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <StatusIcon isValid={walletCheck.isConnected} />
      <Typography>
        Wallet connecté
      </Typography>
    </Box>
    {walletCheck.currentAddress && (
      <Typography variant="body2" color="textSecondary" sx={{ pl: 4 }}>
        {walletCheck.currentAddress}
      </Typography>
    )}
  </>
);
