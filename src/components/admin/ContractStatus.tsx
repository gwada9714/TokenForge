import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
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

interface ContractStatusProps {
  contractCheck: {
    isValid: boolean;
    isDeployed: boolean;
    version?: string;
    address?: string;
    error?: string;
  };
}

export const ContractStatus: React.FC<ContractStatusProps> = ({ contractCheck }) => (
  <Box>
    <Typography variant="subtitle1" gutterBottom>
      État du contrat :
    </Typography>
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StatusIcon isValid={contractCheck.isValid} hasError={!!contractCheck.error} />
        <Typography>
          Contrat {contractCheck.isDeployed ? 'déployé' : 'non déployé'}
          {contractCheck.version && ` (version ${contractCheck.version})`}
        </Typography>
      </Box>
      {contractCheck.address && (
        <Typography variant="body2" color="textSecondary">
          Adresse : {contractCheck.address}
        </Typography>
      )}
      {contractCheck.error && (
        <Typography color="error" variant="body2">
          {contractCheck.error}
        </Typography>
      )}
    </Stack>
  </Box>
);
