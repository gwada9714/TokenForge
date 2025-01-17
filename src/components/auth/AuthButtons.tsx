import React from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { styled } from '@mui/material/styles';

const AuthButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
}));

export const AuthButtons = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (user) {
    return (
      <AuthButtonsContainer>
        <Button
          variant="text"
          color="inherit"
          onClick={handleLogout}
        >
          Déconnexion
        </Button>
      </AuthButtonsContainer>
    );
  }

  return (
    <AuthButtonsContainer>
      <Button
        variant="outlined"
        color="inherit"
        onClick={() => navigate('/login')}
      >
        Connexion
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/signup')}
      >
        Inscription
      </Button>
    </AuthButtonsContainer>
  );
};
