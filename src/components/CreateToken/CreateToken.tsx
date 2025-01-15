import React, { useState, lazy, Suspense, useCallback, useMemo } from 'react';
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
import { useNetwork, useAccount, useBalance } from 'wagmi';
import { TKN_TOKEN_ADDRESS, PREMIUM_TIER_PRICE, BASIC_TIER_PRICE, TKN_PAYMENT_DISCOUNT } from '@/constants';

// Lazy loading des composants
const PlanSelection = lazy(() => import('./PlanSelection'));
const TokenConfiguration = lazy(() => import('./TokenConfiguration'));
const TokenVerification = lazy(() => import('./TokenVerification'));
const TokenDeployment = lazy(() => import('./TokenDeployment'));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" py={4}>
    <CircularProgress />
  </Box>
);

const CreateToken: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    plan: 'basic',
    name: '',
    symbol: '',
    supply: '',
    decimals: 18,
    features: [],
    payWithTKN: true
  });

  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: tknBalance } = useBalance({
    address,
    token: TKN_TOKEN_ADDRESS[chain?.id || 1]
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const calculatePrice = useCallback(() => {
    const basePrice = tokenConfig.plan === 'premium' ? PREMIUM_TIER_PRICE : BASIC_TIER_PRICE;
    if (tokenConfig.payWithTKN) {
      return basePrice - (basePrice * TKN_PAYMENT_DISCOUNT / 10000);
    }
    return basePrice;
  }, [tokenConfig.plan, tokenConfig.payWithTKN]);

  const steps = useMemo(() => [
    {
      title: 'Plan',
      description: 'Choisissez votre forge',
      content: (
        <PlanSelection
          selectedPlan={tokenConfig.plan}
          onPlanSelect={(plan) => setTokenConfig(prev => ({ ...prev, plan }))}
          price={calculatePrice()}
          tknBalance={tknBalance?.value || 0n}
          payWithTKN={tokenConfig.payWithTKN}
          onPaymentMethodChange={(payWithTKN) => 
            setTokenConfig(prev => ({ ...prev, payWithTKN }))
          }
        />
      )
    },
    {
      title: 'Configuration',
      description: 'Forgez votre token',
      content: (
        <TokenConfiguration
          config={tokenConfig}
          onChange={(updates) => setTokenConfig(prev => ({ ...prev, ...updates }))}
          isPremium={tokenConfig.plan === 'premium'}
        />
      )
    },
    {
      title: 'Vérification',
      description: 'Vérifiez les détails',
      content: (
        <TokenVerification
          config={tokenConfig}
          price={calculatePrice()}
          payWithTKN={tokenConfig.payWithTKN}
        />
      )
    },
    {
      title: 'Déploiement',
      description: 'Déployez votre création',
      content: (
        <TokenDeployment
          config={tokenConfig}
          price={calculatePrice()}
          payWithTKN={tokenConfig.payWithTKN}
        />
      )
    }
  ], [tokenConfig, calculatePrice, tknBalance]);

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
                    <Suspense fallback={<LoadingFallback />}>
                      {step.content}
                    </Suspense>
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
