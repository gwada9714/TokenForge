import React from 'react';
import { Box, Stepper, Step, StepLabel, CircularProgress } from '@mui/material';
import { AuthStatus } from '../../types';
import { authMessages } from '../../locales/fr';

interface AuthProgressIndicatorProps {
  status: AuthStatus;
  currentStep: number;
}

const AUTH_STEPS = [
  'Email Authentication',
  'Wallet Connection',
  'Network Verification'
];

export const AuthProgressIndicator: React.FC<AuthProgressIndicatorProps> = ({
  status,
  currentStep
}) => {
  const isLoading = status === 'loading' || status === 'verifying';

  return (
    <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Stepper activeStep={currentStep} alternativeLabel>
        {AUTH_STEPS.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};

          if (index === currentStep && isLoading) {
            labelProps.optional = (
              <Box display="flex" alignItems="center" gap={1} justifyContent="center">
                <CircularProgress size={16} />
                <small>{authMessages.status[status]}</small>
              </Box>
            );
          }

          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};
