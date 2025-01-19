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
import { useAccount, useBalance } from 'wagmi';
import { TokenConfig } from '../../types';
import { 
  TKN_TOKEN_ADDRESS, 
  PREMIUM_TIER_PRICE, 
  BASIC_TIER_PRICE, 
  TKN_PAYMENT_DISCOUNT 
} from '../../constants';

// Lazy loading components
const PlanSelection = lazy(() => import('./steps/PlanSelection'));
const TokenConfiguration = lazy(() => import('./steps/TokenConfiguration'));
const TokenVerification = lazy(() => import('./steps/TokenVerification'));
const TokenDeployment = lazy(() => import('./steps/TokenDeployment'));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" py={4}>
    <CircularProgress />
  </Box>
);

export interface TokenWizardProps {
  onComplete?: (tokenAddress: string) => void;
}

export const TokenWizard: React.FC<TokenWizardProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [tokenConfig, setTokenConfig] = useState<TokenConfig | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null);
  
  const { address } = useAccount();
  
  const { data: tokenBalance } = useBalance({
    address,
    token: TKN_TOKEN_ADDRESS as `0x${string}`,
  });

  const steps = [
    {
      label: 'Select Plan',
      component: PlanSelection,
      props: {
        selectedPlan,
        onPlanSelect: setSelectedPlan,
        tokenBalance,
        premiumPrice: PREMIUM_TIER_PRICE,
        basicPrice: BASIC_TIER_PRICE,
        discount: TKN_PAYMENT_DISCOUNT,
      },
    },
    {
      label: 'Configure Token',
      component: TokenConfiguration,
      props: {
        config: tokenConfig,
        onConfigUpdate: setTokenConfig,
        plan: selectedPlan,
      },
    },
    {
      label: 'Verify Details',
      component: TokenVerification,
      props: {
        config: tokenConfig,
        plan: selectedPlan,
      },
    },
    {
      label: 'Deploy Token',
      component: TokenDeployment,
      props: {
        config: tokenConfig,
        plan: selectedPlan,
        onComplete,
      },
    },
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Create Your Token
          </Typography>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Suspense fallback={<LoadingFallback />}>
                    <step.component {...step.props} />
                  </Suspense>
                  
                  <Stack direction="row" spacing={2} mt={3}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={
                        (index === 0 && !selectedPlan) ||
                        (index === 1 && !tokenConfig) ||
                        index === steps.length - 1
                      }
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </Stack>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Container>
  );
};

export default React.memo(TokenWizard);
