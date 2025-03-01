import React from 'react';
import { Box, Paper, Typography, TextField, Button, Container } from '@mui/material';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';

export const LoginPage: React.FC = () => {
  const { login } = useTokenForgeAuth();
  const { error } = useTokenForgeAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = event.currentTarget.email.value;
    const password = event.currentTarget.password.value;
    await login(email, password);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Connexion
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Se connecter
            </Button>
          </Box>
          {error && <div className="error">{error.message}</div>}
        </Paper>
      </Box>
    </Container>
  );
};
