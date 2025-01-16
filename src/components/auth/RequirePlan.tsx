import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTokenForgePremium } from '@/hooks/useTokenForgePremium';
import { PlanType } from '@/types/premium';

interface RequirePlanProps {
  children: React.ReactNode;
  requiredPlan: PlanType;
}

export const RequirePlan: React.FC<RequirePlanProps> = ({ children, requiredPlan }) => {
  const navigate = useNavigate();
  const { userPlan } = useTokenForgePremium();

  if (userPlan === undefined) {
    return <Box>Chargement...</Box>;
  }

  if (userPlan < requiredPlan) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          Accès Restreint
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Cette fonctionnalité nécessite un niveau {PlanType[requiredPlan]}.
          Veuillez mettre à niveau votre plan pour y accéder.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/plans')}
          sx={{ mt: 2 }}
        >
          Voir les Plans
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};
