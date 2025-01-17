import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { Box, Button, TextField, Typography, Alert, Link, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in successful:", result);
      navigate('/');
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || 'Failed to login with Google');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        mx: 'auto',
        p: 3,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Login to TokenForge
      </Typography>
      
      {error && <Alert severity="error">{error}</Alert>}

      <Button
        type="button"
        variant="outlined"
        size="large"
        fullWidth
        onClick={handleGoogleLogin}
        sx={{ mb: 2 }}
      >
        Sign in with Google
      </Button>

      <Divider sx={{ my: 2 }}>or</Divider>

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
      >
        Login
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={handleForgotPassword}
          sx={{ display: 'block', mb: 1 }}
        >
          Forgot Password?
        </Link>
        <Link href="/signup" variant="body2">
          Don't have an account? Sign up
        </Link>
      </Box>
    </Box>
  );
};
