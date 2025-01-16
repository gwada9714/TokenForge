import React from 'react';
import { Container } from '@mui/material';
import ProfitDashboard from '@/components/Dashboard/ProfitDashboard';

const ProfitDashboardPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <ProfitDashboard />
    </Container>
  );
};

export default ProfitDashboardPage;
