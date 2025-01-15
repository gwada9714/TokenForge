import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  StepContent,
} from '@mui/material';
import { TokenConfig } from '@/types/token';
import PlanSelection from './PlanSelection';
import TokenConfiguration from './TokenConfiguration';
import TokenVerification from './TokenVerification';
import TokenDeployment from './TokenDeployment';

const steps = [
  { title: 'Plan', description: 'Choisissez votre forge' },
  { title: 'Configuration', description: 'Forgez votre token' },
  { title: 'Vérification', description: 'Vérifiez les détails' },
  { title: 'Déploiement', description: 'Déployez votre création' },
];

const CreateToken: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    plan: '',
    name: '',
    symbol: '',
    supply: '',
    decimals: 18,
    features: [],
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <PlanSelection setTokenConfig={setTokenConfig} />;
      case 1:
        return <TokenConfiguration tokenConfig={tokenConfig} setTokenConfig={setTokenConfig} />;
      case 2:
        return <TokenVerification tokenConfig={tokenConfig} />;
      case 3:
        return <TokenDeployment tokenConfig={tokenConfig} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Forge de Token
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.title}>
                <StepLabel
                  optional={
                    <Typography variant="caption">{step.description}</Typography>
                  }
                >
                  {step.title}
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {renderStepContent()}
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        variant="outlined"
                      >
                        Retour
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={activeStep === steps.length - 1}
                      >
                        {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                      </Button>
                    </Stack>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateToken;
