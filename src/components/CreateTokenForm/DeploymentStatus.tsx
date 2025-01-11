import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Link } from '@mui/material';
import { PublicClient } from 'viem';
import { getDeploymentStatus } from '../../services/contractDeployment';
import { TokenDeploymentStatus } from '../../types/tokens';

interface DeploymentStatusProps {
  status: TokenDeploymentStatus;
  publicClient: PublicClient;
}

const REQUIRED_CONFIRMATIONS = 1; // Add this line

export const DeploymentStatus: React.FC<DeploymentStatusProps> = ({
  status: initialStatus,
  publicClient
}) => {
  const [status, setStatus] = useState<TokenDeploymentStatus>(initialStatus);

  useEffect(() => {
    if (!status.txHash || status.status === 'success' || status.status === 'failed') return;

    const checkStatus = async () => {
      try {
        const result = await getDeploymentStatus(status.txHash!, publicClient);
        setStatus(result);
      } catch (err) {
        setStatus({
          status: 'failed',
          confirmations: status.confirmations,
          error: err instanceof Error ? err.message : 'Unknown error occurred'
        });
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus();

    return () => clearInterval(interval);
  }, [status.txHash, status.status, publicClient]);

  useEffect(() => {
    if (status.confirmations >= REQUIRED_CONFIRMATIONS) {
      setStatus(prev => ({ ...prev, confirmed: true }));
    }
  }, [status.confirmations, REQUIRED_CONFIRMATIONS]);

  const getEtherscanBaseUrl = () => {
    const chainId = publicClient.chain?.id;
    switch (chainId) {
      case 1:
        return 'https://etherscan.io';
      case 11155111:
        return 'https://sepolia.etherscan.io';
      default:
        return 'https://etherscan.io';
    }
  };

  const etherscanBaseUrl = getEtherscanBaseUrl();

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Deployment Status
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {status.status === 'pending' && <CircularProgress size={20} />}
        <Typography>
          {status.status === 'pending' && `Confirming transaction (${status.confirmations} confirmations)`}
          {status.status === 'success' && 'Transaction confirmed'}
          {status.status === 'failed' && 'Transaction failed'}
        </Typography>
      </Box>

      {status.error && (
        <Typography color="error" sx={{ mb: 1 }}>
          Error: {status.error}
        </Typography>
      )}

      {status.txHash && (
        <Typography sx={{ mb: 1 }}>
          Transaction Hash:{' '}
          <Link
            href={`${etherscanBaseUrl}/tx/${status.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {status.txHash}
          </Link>
        </Typography>
      )}

      {status.tokenAddress && (
        <Typography sx={{ mb: 1 }}>
          Token Address:{' '}
          <Link
            href={`${etherscanBaseUrl}/token/${status.tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {status.tokenAddress}
          </Link>
        </Typography>
      )}

      {status.proxyAddress && (
        <Typography>
          Proxy Address:{' '}
          <Link
            href={`${etherscanBaseUrl}/address/${status.proxyAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {status.proxyAddress}
          </Link>
        </Typography>
      )}
    </Box>
  );
};
