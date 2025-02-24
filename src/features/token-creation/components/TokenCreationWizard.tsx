import React from 'react';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { SubscriptionTier } from '@/features/subscription/types';
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';

const steps = ['Sélection du niveau', 'Configuration du token', 'Déploiement'];

export const TokenCreationWizard: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const { currentSubscription, checkFeature } = useSubscription();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const canDeployMainnet = checkFeature('canDeployMainnet');
  const hasMintBurn = checkFeature('hasMintBurn');
  const hasBlacklist = checkFeature('hasBlacklist');

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Sélectionnez votre niveau de forge
            </Typography>
            {/* Subscription tier selection will be implemented here */}
          </Box>
        )}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configurez votre token
            </Typography>
            {/* Token configuration form will be implemented here */}
          </Box>
        )}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Déployez votre token
            </Typography>
            {/* Deployment options will be implemented here */}
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
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
        </Box>
      </Box>
    </Box>
  );
};
