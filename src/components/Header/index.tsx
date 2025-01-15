import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'white', textDecoration: 'none', mr: 4 }}
          >
            TokenForge
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/dashboard"
              color="inherit"
              sx={{ 
                backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/create"
              color="inherit"
              sx={{ 
                backgroundColor: isActive('/create') ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              Créer un Token
            </Button>
          </Box>
        </Box>

        <ConnectButton />
      </Toolbar>
    </AppBar>
  );
};

export default Header;