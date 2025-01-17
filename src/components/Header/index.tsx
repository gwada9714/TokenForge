import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useAccount } from 'wagmi';

interface HeaderProps {
  menuItems: {
    text: string;
    icon: React.ReactNode;
    path: string;
  }[];
}

const Header: React.FC<HeaderProps> = ({ menuItems }) => {
  const location = useLocation();
  const { isAdmin } = useTokenForgeAdmin();
  const { isConnected } = useAccount();

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: 1,
      }}
    >
      <Toolbar 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: '64px', sm: '70px' }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: { xs: 1, sm: 2, md: 4 }
          }}
        >
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              whiteSpace: 'nowrap'
            }}
          >
            TokenForge
          </Typography>

          {isConnected && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
              
              {isAdmin && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  sx={{
                    color: isActive('/admin') ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  Admin
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;