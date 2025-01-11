import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Button, Alert } from '@mui/material';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { TokenBaseConfig, TokenAdvancedConfig, TokenDeploymentStatus } from '../types/tokens';
import { TokenPreview } from '../components/TokenPreview/TokenPreview';
import { DeploymentCost } from '../components/DeploymentCost/DeploymentCost';
import { BasicTokenForm } from '../components/TokenForm/BasicTokenForm';
import { AdvancedTokenForm } from '../components/TokenForm/AdvancedTokenForm';
import { deployToken } from '../services/tokenDeployment';

export const CreateToken: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const [baseConfig, setBaseConfig] = useState<TokenBaseConfig>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: 0,
  });

  const [advancedConfig, setAdvancedConfig] = useState<TokenAdvancedConfig>({
    mintable: false,
    burnable: false,
    pausable: false,
    permit: false,
    votes: false,
  });

  const [deploymentStatus, setDeploymentStatus] = useState<TokenDeploymentStatus | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleCreateToken = async () => {
    if (!walletClient || !publicClient || !address) {
      setDeploymentStatus({
        status: 'error',
        error: 'Please connect your wallet first',
      });
      return;
    }

    setIsDeploying(true);
    try {
      const status = await deployToken(
        baseConfig,
        advancedConfig,
        walletClient,
        publicClient
      );
      setDeploymentStatus(status);
    } catch (error) {
      setDeploymentStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const isFormValid = () => {
    return (
      baseConfig.name.trim() !== '' &&
      baseConfig.symbol.trim() !== '' &&
      baseConfig.initialSupply > 0
    );
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Token
        </Typography>

        {deploymentStatus && (
          <Box mb={3}>
            {deploymentStatus.status === 'success' ? (
              <Alert severity="success">
                Token deployed successfully!
                {deploymentStatus.contractAddress && (
                  <Typography variant="body2">
                    Contract Address: {deploymentStatus.contractAddress}
                  </Typography>
                )}
              </Alert>
            ) : (
              <Alert severity="error">
                Deployment failed: {deploymentStatus.error}
              </Alert>
            )}
          </Box>
        )}

        <Box display="grid" gap={3}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <BasicTokenForm
              config={baseConfig}
              onConfigChange={setBaseConfig}
              disabled={isDeploying}
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <AdvancedTokenForm
              config={advancedConfig}
              onConfigChange={setAdvancedConfig}
              disabled={isDeploying}
            />
          </Paper>

          <Box display="flex" gap={3}>
            <Box flex={1}>
              <TokenPreview
                baseConfig={baseConfig}
                advancedConfig={advancedConfig}
              />
            </Box>
            <Box flex={1}>
              <DeploymentCost
                baseConfig={baseConfig}
                advancedConfig={advancedConfig}
              />
            </Box>
          </Box>

          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreateToken}
              disabled={!isFormValid() || isDeploying || !address}
            >
              {isDeploying ? 'Deploying...' : 'Create Token'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
