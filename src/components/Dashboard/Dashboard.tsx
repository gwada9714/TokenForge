import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Text } from '@chakra-ui/react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <Box p={5} shadow="md" borderWidth="1px">
          <Text fontSize="xl" mb={4}>Create New Token</Text>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/tokens/create')}
          >
            Create Token
          </Button>
        </Box>
      </Grid>
    </Box>
  );
};

export default Dashboard;