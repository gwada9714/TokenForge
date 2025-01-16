import React from 'react';
import { Box, Container } from '@mui/material';
import TokenWizard from '@/components/TokenWizard/TokenWizard';

const CreateTokenWizard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <TokenWizard />
      </Box>
    </Container>
  );
};

export default CreateTokenWizard;
