import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAccount } from 'wagmi';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { Link as RouterLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navigation: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { isAdmin } = useTokenForgeAdmin();

  // Calcul de l'affichage du bouton admin
  const shouldShowAdminButton = isConnected && isAdmin;

  console.log('Navigation - Component State:', JSON.stringify({
    isConnected,
    address: address || null,
    isAdmin,
    shouldShowAdminButton
  }, null, 2));

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
          {shouldShowAdminButton && (
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
          <ConnectButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
