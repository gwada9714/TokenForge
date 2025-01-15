import React, { useEffect } from 'react';
import { Typography, Button, Box, Stack, CircularProgress } from '@mui/material';
import { useWeb3 } from '../providers';

const TokenList: React.FC = () => {
  const { isConnected, connect, error, isInitializing } = useWeb3();

  useEffect(() => {
    console.log('TokenList mounted, Web3 state:', { isConnected, error, isInitializing });
  }, [isConnected, error, isInitializing]);

  if (isInitializing) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        padding: 2,
        width: '100%',
        maxWidth: 'lg',
        margin: '0 auto'
      }}
    >
      <Stack spacing={4}>
        <Typography 
          component="h1" 
          variant="h4" 
          gutterBottom
          fontWeight="bold"
        >
          Mes Tokens
        </Typography>

        {error && (
          <Stack spacing={2} bgcolor="error.light" p={2} borderRadius={1}>
            <Typography 
              color="error.main" 
              variant="body1"
            >
              {error}
            </Typography>
          </Stack>
        )}

        {!isConnected && (
          <Box textAlign="center" py={4}>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              gutterBottom
              mb={2}
            >
              Connectez votre wallet pour voir vos tokens
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                console.log('Connecting wallet...');
                connect();
              }}
            >
              Connecter mon wallet
            </Button>
          </Box>
        )}

        {isConnected && (
          <Typography variant="body1">
            Wallet connecté ! La liste des tokens va s'afficher ici.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default TokenList;