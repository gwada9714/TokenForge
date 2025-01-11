import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Link } from '@mui/material';
import { PublicClient } from 'viem';
import { getDeploymentStatus } from '../../services/contractDeployment';
import { TokenDeploymentStatus } from '../../types/tokens';

interface DeploymentStatusProps {
  status: TokenDeploymentStatus;
  publicClient: PublicClient;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({
  status: initialStatus,
  publicClient
}) => {
  const [status, setStatus] = useState<TokenDeploymentStatus>(initialStatus);

  useEffect(() => {
    if (!status.txHash || status.status === 'success' || status.status === 'error' || status.status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const updatedStatus = await getDeploymentStatus(status.txHash!, publicClient);
        setStatus(updatedStatus);
      } catch (error) {
        console.error('Failed to get deployment status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status.txHash, status.status, publicClient]);

  const renderStatus = () => {
    switch (status.status) {
      case 'pending':
        return (
          <>
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              <Typography>
                Deploying your token... {status.confirmations ? `(${status.confirmations} confirmations)` : ''}
              </Typography>
            </Box>
            {status.txHash && (
              <Link
                href={`https://etherscan.io/tx/${status.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Etherscan
              </Link>
            )}
          </>
        );

      case 'success':
        return (
          <>
            <Typography color="success.main">
              Token deployed successfully!
            </Typography>
            {status.txHash && (
              <Link
                href={`https://etherscan.io/tx/${status.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View transaction
              </Link>
            )}
            {status.tokenAddress && (
              <Link
                href={`https://etherscan.io/token/${status.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View token
              </Link>
            )}
            {status.proxyAddress && (
              <Link
                href={`https://etherscan.io/address/${status.proxyAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View proxy
              </Link>
            )}
          </>
        );

      case 'failed':
      case 'error':
        return (
          <>
            <Typography color="error.main">
              {status.error || 'Failed to deploy token'}
            </Typography>
            {status.txHash && (
              <Link
                href={`https://etherscan.io/tx/${status.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View transaction
              </Link>
            )}
          </>
        );
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {renderStatus()}
    </Box>
  );
};

export default DeploymentStatus;
