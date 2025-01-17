import React from 'react';
import { Container, Typography } from '@mui/material';
import { PlanSelector } from '../components/Plans/PlanSelector';

const Pricing: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        className="font-heading font-bold text-primary-main"
      >
        Plans & Tarifs
      </Typography>
      
      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        component="p"
        sx={{ mb: 6 }}
      >
        Choisissez le plan qui correspond à vos besoins
      </Typography>

      <PlanSelector />
    </Container>
  );
};

export default Pricing;
