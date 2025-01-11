import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { TokenBaseConfig, TokenAdvancedConfig } from '../../types/tokens';
import { generateContractBytecode } from '../../services/contractGenerator';
import { useWalletClient } from '../../hooks/useWalletClient';

interface DeploymentCostProps {
  baseConfig: TokenBaseConfig;
  advancedConfig: TokenAdvancedConfig;
}

export const DeploymentCost: React.FC<DeploymentCostProps> = ({ baseConfig, advancedConfig }) => {
  const [estimatedGas, setEstimatedGas] = useState<bigint | null>(null);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    const estimateCost = async () => {
      try {
        setIsLoading(true);
        const bytecode = await generateContractBytecode(baseConfig, advancedConfig);
        
        const { data: signer } = useWalletClient();
        const address = signer ? (await signer.getAddresses())[0] : undefined;
        
        // Create a contract deployment transaction
        const tx = {
          account: address as `0x${string}`,
          to: undefined,
          data: bytecode,
        };
        
        const gas = await publicClient.estimateGas(tx);
        const price = await publicClient.getGasPrice();
        
        setEstimatedGas(gas);
        setGasPrice(price);
      } catch (error) {
        console.error('Error estimating deployment cost:', error);
      } finally {
        setIsLoading(false);
      }
    };

    estimateCost();
  }, [baseConfig, advancedConfig, publicClient]);

  const calculateTotalCost = () => {
    if (!estimatedGas || !gasPrice) return null;
    return estimatedGas * gasPrice;
  };

  const totalCost = calculateTotalCost();

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Estimated Deployment Cost
      </Typography>
      <Box sx={{ mt: 2 }}>
        {isLoading ? (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Calculating cost...</Typography>
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Estimated Gas:</Typography>
              <Typography>{estimatedGas?.toString() ?? 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Gas Price:</Typography>
              <Typography>{gasPrice ? `${formatEther(gasPrice)} ETH` : 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">Total Cost:</Typography>
              <Typography fontWeight="bold">
                {totalCost ? `${formatEther(totalCost)} ETH` : 'N/A'}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};
