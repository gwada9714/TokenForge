import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to TokenForge
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Create and manage your custom tokens with ease
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/create')}
            sx={{ mr: 2 }}
          >
            Create Token
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/my-tokens')}
          >
            View My Tokens
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
