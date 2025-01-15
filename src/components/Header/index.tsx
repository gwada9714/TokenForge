import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface HeaderProps {
  menuItems: {
    text: string;
    icon: React.ReactNode;
    path: string;
  }[];
}

const Header: React.FC<HeaderProps> = ({ menuItems }) => {
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
            sx={{ textDecoration: 'none', color: 'inherit', mr: 4 }}
          >
            TokenForge
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
                sx={{
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        </Box>
        <ConnectButton />
      </Toolbar>
    </AppBar>
  );
};

export default Header;