import {
  Box,
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Link as MuiLink,
  useMediaQuery
} from '@mui/material';
import { Link } from 'react-router-dom';
import { DarkMode, LightMode, Menu as MenuIcon } from '@mui/icons-material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { to: '/', label: 'Accueil' },
    { to: '/create', label: 'Créer un Token' },
    { to: '/my-tokens', label: 'Mes Tokens' },
    { to: '/pricing', label: 'Plans & Tarifs' },
    { to: '/staking', label: 'Staking' },
  ];

  const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <MuiLink
      component={Link}
      to={to}
      sx={{
        px: 2,
        py: 1,
        borderRadius: 1,
        textDecoration: 'none',
        color: 'text.primary',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {children}
    </MuiLink>
  );

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={1}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo.svg" alt="TokenForge Logo" style={{ height: 40 }} />
        </Box>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.to}
                  component={Link}
                  to={item.to}
                  onClick={handleMenuClose}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Stack direction="row" spacing={4} alignItems="center">
            {menuItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </Stack>
        )}

        <Stack direction="row" spacing={2} alignItems="center">
          <ConnectButton />
          <IconButton 
            onClick={() => {
              // You'll need to implement dark mode toggle with MUI
              document.documentElement.setAttribute('data-theme', theme.palette.mode === 'dark' ? 'light' : 'dark');
            }}
            color="inherit"
          >
            {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
