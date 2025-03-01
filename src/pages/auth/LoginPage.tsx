import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Link, CircularProgress } from '@mui/material';
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../features/auth';
import { useTokenForgeAuth } from '../../features/auth/hooks/useTokenForgeAuth';
import { AuthError } from '../../features/auth/errors/AuthError';

const LoginPage: React.FC = () => {
  const { isAuthenticated, signIn } = useTokenForgeAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setIsLoading(false);
    }
  };

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
          <LoginForm 
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
          />
          {isLoading && <CircularProgress data-testid='loading-spinner' />}
          {error && <Typography color="error">{error.message}</Typography>}
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

export default LoginPage;
