import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Container,
  Heading,
  Card,
  CardBody,
  Button,
  HStack,
} from '@chakra-ui/react';
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
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    plan: '',
    name: '',
    symbol: '',
    supply: '',
    decimals: 18,
    features: [],
  });

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

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={8} textAlign="center">Forge de Token</Heading>
      
      <Stepper index={activeStep} mb={8}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardBody>
          {renderStepContent()}
          
          <HStack justify="space-between" mt={6}>
            <Button
              onClick={handleBack}
              isDisabled={activeStep === 0}
              variant="outline"
            >
              Retour
            </Button>
            <Button
              onClick={handleNext}
              isDisabled={activeStep === steps.length - 1}
              colorScheme="red"
            >
              {activeStep === steps.length - 2 ? 'Déployer' : 'Suivant'}
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default CreateToken;
