import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { usePublicClient, useWalletClient } from 'wagmi';
import { formatEther, parseUnits } from 'viem';
import { TokenBaseConfig, TokenAdvancedConfig } from '../../types/tokens';
import { getTokenFactoryContract } from '../../services/contracts';
import { generateContractBytecode } from '../../services/contractGenerator';

interface DeploymentCostProps {
  baseConfig: TokenBaseConfig;
  advancedConfig: TokenAdvancedConfig;
}

export const DeploymentCost: React.FC<DeploymentCostProps> = ({ baseConfig, advancedConfig }) => {
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const estimateGas = async () => {
      if (!publicClient) return;

      try {
        setIsLoading(true);
        setError(null);

        const factoryAddress = process.env.VITE_TOKEN_FACTORY_ADDRESS;
        if (!factoryAddress || !factoryAddress.startsWith('0x')) {
          throw new Error('Invalid token factory address');
        }

        const contract = getTokenFactoryContract(factoryAddress as `0x${string}`);
        
        const bytecode = await generateContractBytecode(baseConfig, advancedConfig);
        
        let address: `0x${string}` | undefined;
        if (walletClient) {
          const addresses = await walletClient.getAddresses();
          address = addresses[0];
        }

        if (!address) {
          throw new Error('No wallet connected');
          return;
        }
        
        // Create a contract deployment transaction
        const tx = {
          account: address, // Now address is guaranteed to be defined
          to: undefined as unknown as `0x${string}`, // Cast undefined to expected address type
          data: bytecode,
        };
        
        const gasEstimate = await publicClient.estimateGas(tx);
        const gasPrice = await publicClient.getGasPrice();
        const gasCost = gasEstimate * gasPrice;
        
        setEstimatedCost(formatEther(gasCost));
      } catch (error: any) {
        setError(error.message || 'Failed to estimate gas');
      } finally {
        setIsLoading(false);
      }
    };

    estimateGas();
  }, [baseConfig, advancedConfig, publicClient, walletClient]);

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
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">Total Cost:</Typography>
              <Typography fontWeight="bold">
                {estimatedCost ?? 'N/A'}
              </Typography>
            </Box>
            {error && (
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography color="error">Error:</Typography>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};
