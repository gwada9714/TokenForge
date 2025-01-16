import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import BlockchainSelection from './steps/BlockchainSelection';
import TokenConfiguration from './steps/TokenConfiguration';
import TokenFeatures from './steps/TokenFeatures';
import ForgeInfo from './steps/ForgeInfo';
import ServiceTier from './steps/ServiceTier';
import Summary from './steps/Summary';
import Deployment from './steps/Deployment';
import { useTokenForge } from '@/hooks/useTokenForge';

const steps = [
  'Select Blockchain',
  'Configure Token',
  'Optional Features',
  'Forge Tax Info',
  'Service Tier',
  'Review',
  'Deploy'
];

const TokenWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tokenData, setTokenData] = useState({
    blockchain: '',
    name: '',
    symbol: '',
    supply: '',
    decimals: '18',
    features: {
      mint: false,
      burn: false
    },
    serviceTier: 'basic',
    paymentToken: ''
  });
  
  const { createToken, isCreating } = useTokenForge();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleUpdateData = (data: Partial<typeof tokenData>) => {
    setTokenData((prev) => ({ ...prev, ...data }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BlockchainSelection data={tokenData} onUpdate={handleUpdateData} />;
      case 1:
        return <TokenConfiguration data={tokenData} onUpdate={handleUpdateData} />;
      case 2:
        return <TokenFeatures data={tokenData} onUpdate={handleUpdateData} />;
      case 3:
        return <ForgeInfo />;
      case 4:
        return <ServiceTier data={tokenData} onUpdate={handleUpdateData} />;
      case 5:
        return <Summary data={tokenData} />;
      case 6:
        return <Deployment data={tokenData} />;
      default:
        return 'Unknown step';
    }
  };

  const handleDeploy = async () => {
    try {
      await createToken({
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: parseInt(tokenData.decimals),
        initialSupply: BigInt(tokenData.supply),
        features: {
          mintable: tokenData.features.mint,
          burnable: tokenData.features.burn,
          pausable: true
        },
        isPremium: tokenData.serviceTier === 'premium',
        payWithTKN: tokenData.paymentToken === 'TKN'
      });
    } catch (error) {
      console.error('Error deploying token:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create Your Token
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || isCreating}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleDeploy}
              disabled={isCreating}
            >
              {isCreating ? (
                <CircularProgress size={24} />
              ) : (
                'Deploy Token'
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isCreating}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TokenWizard;
