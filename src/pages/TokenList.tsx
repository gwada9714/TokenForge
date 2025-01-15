import React from 'react';
import { Typography, Button, Box, Container, Stack } from '@mui/material';
import { useWeb3 } from '../providers';

const TokenList: React.FC = () => {
  const { isConnected, connect, error } = useWeb3();

  return (
    <Container maxWidth="lg">
      <Stack spacing={4} sx={{ py: 4 }}>
        <Typography 
          component="h1" 
          variant="h4" 
          gutterBottom
        >
          Mes Tokens
        </Typography>

        {error && (
          <Stack spacing={2}>
            <Typography 
              color="error" 
              variant="body1"
            >
              {error}
            </Typography>
          </Stack>
        )}

        {!isConnected && (
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => connect()}
              size="large"
            >
              Connecter le wallet
            </Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default TokenList;