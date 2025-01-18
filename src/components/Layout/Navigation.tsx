import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from '@mui/material';
import { useAccount } from 'wagmi';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { Link as RouterLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navigation: React.FC = () => {
  const { isConnected } = useAccount();
  const { 
    isOwner, 
    isPaused,
    isLoading,
    error 
  } = useTokenForgeAdmin();

  useEffect(() => {
    console.log('Navigation state:', {
      isConnected,
      isOwner,
      timestamp: new Date().toISOString()
    });
  }, [isConnected, isOwner]);

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'primary.dark',
        mb: 2
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            color: 'inherit', 
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          TokenForge
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isConnected && (
            <>
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/create">
                    Créer un Token
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/my-tokens">
                    Mes Tokens
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/staking">
                    Staking
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/pricing">
                    Plans
                  </Button>
                </>
              )}
              {isOwner && (
                <>
                  <Button 
                    color="error"
                    variant="contained"
                    component={RouterLink} 
                    to="/admin"
                    sx={{ 
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      }
                    }}
                  >
                    Admin
                  </Button>
                  {isPaused && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      CONTRAT EN PAUSE
                    </Typography>
                  )}
                </>
              )}
              {error && (
                <Typography 
                  variant="caption" 
                  color="error"
                  sx={{ ml: 2 }}
                >
                  Erreur de connexion
                </Typography>
              )}
            </>
          )}
          <ConnectButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
