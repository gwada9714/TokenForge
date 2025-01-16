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
          <Box 
            sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 1, md: 2 },
              overflow: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
                size="small"
                sx={{
                  px: { xs: 1, sm: 2 },
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  backgroundColor: isActive(item.path) ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
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