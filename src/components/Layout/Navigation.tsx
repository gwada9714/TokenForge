import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { Link as RouterLink } from 'react-router-dom';
import { CustomConnectButton } from '../ConnectWallet/CustomConnectButton';

const Navigation: React.FC = () => {
  const { 
    error,
    isOwner,
    networkStatus,
    isLoading
  } = useTokenForgeAdmin();

  // Afficher toujours la barre de navigation
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
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          TokenForge
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              {networkStatus.isConnected && networkStatus.isCorrectNetwork && (
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
                  {isOwner && (
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
                  )}
                </>
              )}
            </>
          )}
          
          {error && (
            <Typography 
              variant="caption" 
              color="error"
              sx={{ ml: 2 }}
            >
              {error}
            </Typography>
          )}
          <CustomConnectButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
