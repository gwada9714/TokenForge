import React, { useState, lazy, Suspense } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { TokenConfig } from '@/types/token';

// Lazy loading des composants
const PlanSelection = lazy(() => import('./PlanSelection'));
const TokenConfiguration = lazy(() => import('./TokenConfiguration'));
const TokenVerification = lazy(() => import('./TokenVerification'));
const TokenDeployment = lazy(() => import('./TokenDeployment'));

const steps = [
  { title: 'Plan', description: 'Choisissez votre forge' },
  { title: 'Configuration', description: 'Forgez votre token' },
  { title: 'Vérification', description: 'Vérifiez les détails' },
  { title: 'Déploiement', description: 'Déployez votre création' },
];

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" py={4}>
    <CircularProgress />
  </Box>
);

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
    return (
      <Suspense fallback={<LoadingFallback />}>
        {activeStep === 0 && <PlanSelection setTokenConfig={setTokenConfig} />}
        {activeStep === 1 && <TokenConfiguration tokenConfig={tokenConfig} setTokenConfig={setTokenConfig} />}
        {activeStep === 2 && <TokenVerification tokenConfig={tokenConfig} />}
        {activeStep === 3 && <TokenDeployment tokenConfig={tokenConfig} />}
      </Suspense>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Forge de Token
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step) => (
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

export default React.memo(CreateToken);
