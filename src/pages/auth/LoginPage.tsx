import React from 'react';
import { Container, Paper, Typography, Box, Link } from '@mui/material';
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../features/auth';
import { useTokenForgeAuthContext } from '../../features/auth';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useTokenForgeAuthContext();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>
          <LoginForm />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/signup" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
