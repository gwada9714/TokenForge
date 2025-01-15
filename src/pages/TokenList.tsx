import React from 'react';
import { Typography, Button, Box, Container } from '@mui/material';
import { useWeb3 } from '../providers';

const TokenList: React.FC = () => {
  const { isConnected, connect, error } = useWeb3();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography 
          component="h1" 
          variant="h4" 
          gutterBottom
          sx={{ mb: 4 }}
        >
          Mes Tokens
        </Typography>

        {error && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              color="error" 
              variant="body1"
              sx={{ mb: 2 }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {!isConnected && (
          <Box sx={{ mt: 2 }}>
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
      </Box>
    </Container>
  );
};

export default TokenList;