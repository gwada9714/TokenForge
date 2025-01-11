import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { TokenBaseConfig, TokenAdvancedConfig } from '../types/tokens';
import { TokenPreview } from '../components/TokenPreview/TokenPreview';
import { DeploymentCost } from '../components/DeploymentCost/DeploymentCost';
import { BasicTokenForm } from '../components/TokenForm/BasicTokenForm';
import { AdvancedTokenForm } from '../components/TokenForm/AdvancedTokenForm';

export const CreateToken: React.FC = () => {
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

  const handleCreateToken = async () => {
    // TODO: Implémenter la création du token
    console.log('Creating token with config:', { baseConfig, advancedConfig });
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

        <Box display="grid" gap={3}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <BasicTokenForm
              config={baseConfig}
              onConfigChange={setBaseConfig}
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <AdvancedTokenForm
              config={advancedConfig}
              onConfigChange={setAdvancedConfig}
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
              disabled={!isFormValid()}
            >
              Create Token
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
