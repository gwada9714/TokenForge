import React, { useState } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { TokenBaseConfig, TokenAdvancedConfig } from '../types/tokens';
import { TokenPreview } from '../components/TokenPreview/TokenPreview';
import { DeploymentCost } from '../components/DeploymentCost/DeploymentCost';

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

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Token
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Token Configuration
          </Typography>
          {/* Ajouter les composants de configuration ici */}
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
      </Box>
    </Container>
  );
};
