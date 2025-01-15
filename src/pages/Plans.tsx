import React from 'react';
import { Container } from '@chakra-ui/react';
import PlanSelector from '../components/Plans/PlanSelector';

const Plans: React.FC = () => {
  return (
    <Container maxW="container.xl">
      <PlanSelector />
    </Container>
  );
};

export default Plans;
