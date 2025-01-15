import React from 'react';
import { Container } from '@mui/material';
import PlanSelector from '../components/Plans/PlanSelector';

const Plans: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <PlanSelector />
    </Container>
  );
};

export default Plans;
