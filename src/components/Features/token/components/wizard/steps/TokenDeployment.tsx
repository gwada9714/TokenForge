import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { TokenConfig } from '../../../types';

interface TokenDeploymentProps {
  config: TokenConfig | null;
  plan: 'basic' | 'premium' | null;
  onComplete?: (tokenAddress: string) => void;
}

const TokenDeployment: React.FC<TokenDeploymentProps> = ({
  config,
  plan,
  onComplete,
}) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = React.useState<string | null>(null);

  const deploymentSteps = [
    'Payment Processing',
    'Contract Deployment',
    'Verification',
  ];

  // Simulated deployment process
  React.useEffect(() => {
    const deploy = async () => {
      try {
        // Payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setActiveStep(1);

        // Contract deployment
        await new Promise(resolve => setTimeout(resolve, 3000));
        setActiveStep(2);

        // Contract verification
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulated token address
        const address = '0x' + '1234567890'.repeat(4);
        setTokenAddress(address);
        onComplete?.(address);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Deployment failed');
      }
    };

    if (config && plan) {
      deploy();
    }
  }, [config, plan, onComplete]);

  if (!config || !plan) {
    return (
      <Alert severity="error">
        Please complete the previous steps first
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (tokenAddress) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          Token deployed successfully!
        </Alert>
        
        <Typography variant="body1" gutterBottom>
          Your token has been deployed to:
        </Typography>
        
        <Typography 
          variant="body1" 
          component="code" 
          sx={{ 
            display: 'block',
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            wordBreak: 'break-all'
          }}
        >
          {tokenAddress}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => window.open(`https://etherscan.io/token/${tokenAddress}`, '_blank')}
          >
            View on Etherscan
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {deploymentSteps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {deploymentSteps[activeStep]}...
        </Typography>
      </Box>
    </Box>
  );
};

export default React.memo(TokenDeployment);
