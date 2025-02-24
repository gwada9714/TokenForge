import React from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTokenForgeAuth } from '@/features/auth/hooks/useTokenForgeAuth';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useTokenForgeAuth();
  const { isAuthenticated } = state;

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center'
          }}
        >
          Bienvenue sur TokenForge
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          align="center"
          sx={{ maxWidth: 'sm', mb: 4 }}
        >
          La plateforme de création de tokens la plus avancée. Créez, gérez et suivez vos tokens en toute simplicité.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem'
              }}
            >
              Accéder au Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem'
                }}
              >
                Créer un compte
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem'
                }}
              >
                Se connecter
              </Button>
            </>
          )}
        </Stack>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom align="center">
            Pourquoi choisir TokenForge ?
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
              mt: 4
            }}
          >
            {[
              {
                title: 'Simple',
                description: 'Interface intuitive pour créer votre token en quelques clics'
              },
              {
                title: 'Sécurisé',
                description: 'Sécurité maximale avec audit de code et vérification KYC'
              },
              {
                title: 'Support 24/7',
                description: 'Une équipe d\'experts à votre disposition'
              }
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 1
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
