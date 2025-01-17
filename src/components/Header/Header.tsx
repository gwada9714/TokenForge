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
  useMediaQuery,
  Button
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { DarkMode, LightMode, Menu as MenuIcon } from '@mui/icons-material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useAccount } from 'wagmi';

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { isAdmin } = useTokenForgeAdmin();
  const { isConnected } = useAccount();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const menuItems = [
    { to: '/', label: 'Accueil' },
    { to: '/create', label: 'Créer un Token' },
    { to: '/my-tokens', label: 'Mes Tokens' },
    { to: '/pricing', label: 'Plans & Tarifs' },
    { to: '/staking', label: 'Staking' },
    ...(isConnected && isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
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

  const AuthButtons = () => {
    if (user) {
      return (
        <Button
          variant="text"
          color="inherit"
          onClick={handleLogout}
        >
          Déconnexion
        </Button>
      );
    }

    return (
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          color="primary"
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
      </Stack>
    );
  };

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
              <MenuItem onClick={handleMenuClose}>
                <AuthButtons />
              </MenuItem>
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
          <AuthButtons />
          <ConnectButton />
          <IconButton 
            onClick={() => {
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
