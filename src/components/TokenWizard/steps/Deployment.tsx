import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';

interface DeploymentProps {
  data: {
    name: string;
    symbol: string;
    supply: string;
    blockchain: string;
  };
}

const deploymentSteps = [
  'Initializing Deployment',
  'Deploying Token Contract',
  'Verifying Contract',
  'Finalizing Setup',
];

const Deployment: React.FC<DeploymentProps> = ({ data }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate deployment process
    const timer = setInterval(() => {
      setActiveStep((prevStep) => {
        // Simuler une erreur aléatoire pour démonstration
        if (prevStep === 1 && Math.random() < 0.1) {
          setError('Une erreur est survenue lors du déploiement. Veuillez réessayer.');
          clearInterval(timer);
          return prevStep;
        }
        
        if (prevStep === deploymentSteps.length - 1) {
          clearInterval(timer);
          return prevStep;
        }
        return prevStep + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Deploying Your Token
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please wait while we deploy your token to the {data.blockchain} network.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {deploymentSteps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Box display="flex" alignItems="center" gap={2}>
                  {label}
                  {activeStep === index && (
                    <CircularProgress size={20} />
                  )}
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === deploymentSteps.length - 1 && !error && (
          <Alert severity="success" sx={{ mt: 3 }}>
            🎉 Congratulations! Your token {data.name} ({data.symbol}) has been
            successfully deployed to the {data.blockchain} network.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default Deployment;
