import {
  Box,
  AppBar,
  Toolbar,
  Button,
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
              <MenuItem component={Link} to="/create" onClick={handleMenuClose}>
                Forger un Token
              </MenuItem>
              <MenuItem component={Link} to="/tokens" onClick={handleMenuClose}>
                Mes Tokens
              </MenuItem>
              <MenuItem component={Link} to="/plans" onClick={handleMenuClose}>
                Plans & Tarifs
              </MenuItem>
              <MenuItem component={Link} to="/staking" onClick={handleMenuClose}>
                Staking
              </MenuItem>
              <MenuItem component={Link} to="/launchpad" onClick={handleMenuClose}>
                Launchpad
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Stack direction="row" spacing={4} alignItems="center">
            <NavLink to="/create">Forger un Token</NavLink>
            <NavLink to="/tokens">Mes Tokens</NavLink>
            <NavLink to="/plans">Plans & Tarifs</NavLink>
            <NavLink to="/staking">Staking</NavLink>
            <NavLink to="/launchpad">Launchpad</NavLink>
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
