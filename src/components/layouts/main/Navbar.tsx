import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTokenForgeAuth } from '../../../features/auth/hooks/useTokenForgeAuth';
import { useWalletStatus } from '../../../features/auth/hooks/useWalletStatus';
import { TokenForgeLogo } from '../../Icons/TokenForgeLogo';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  alpha,
  ButtonProps,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const services = [
  { name: 'Création de Launchpad (IDO)', href: '/services/launchpad' },
  { name: 'Création de plateforme de Staking', href: '/services/staking' },
  { name: 'Assistance Marketing et Listing', href: '/services/marketing' },
  { name: 'KYC (Know Your Customer)', href: '/services/kyc' },
];

const community = [
  { name: 'Blog', href: '/blog' },
  { name: 'Documentation', href: '/docs' },
  { name: 'Discord', href: 'https://discord.gg/tokenforge', external: true },
  { name: 'Telegram', href: 'https://t.me/tokenforge', external: true },
  { name: 'Twitter', href: 'https://twitter.com/tokenforge', external: true },
];

const glowAnimation = keyframes`
  0% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
  100% { filter: brightness(1); }
`;

const StyledRouterLink = styled(RouterLink)`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const LogoContainer = styled('div')`
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.05);
    animation: ${glowAnimation} 2s infinite;
  }
`;

interface NavButtonProps extends ButtonProps {
  component?: React.ElementType;
  to?: string;
  $loading?: boolean;
}

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => !['component', 'to', '$loading'].includes(prop as string),
})<NavButtonProps>(({ theme, $loading }) => ({
  color: alpha(theme.palette.common.white, 0.85),
  marginLeft: theme.spacing(2),
  fontFamily: 'Poppins, Roboto, sans-serif',
  fontWeight: 400,
  position: 'relative',
  textTransform: 'none',
  opacity: $loading ? 0.7 : 1,
  pointerEvents: $loading ? 'none' : 'auto',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '0%',
    height: '2px',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#D97706',
    transition: 'width 0.3s ease',
  },
  '&:hover': {
    color: '#D97706',
    backgroundColor: 'transparent',
    '&::after': {
      width: '100%',
    },
  },
}));

const ConnectButton = styled(Button, {
  shouldForwardProp: (prop) => !['component', 'to', '$loading'].includes(prop as string),
})<NavButtonProps>(({ theme, $loading }) => ({
  marginLeft: theme.spacing(2),
  borderColor: '#D97706',
  color: '#D97706',
  borderRadius: '8px',
  padding: '8px 24px',
  fontFamily: 'Poppins, Roboto, sans-serif',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  position: 'relative',
  opacity: $loading ? 0.7 : 1,
  pointerEvents: $loading ? 'none' : 'auto',
  '&:hover': {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
    color: theme.palette.common.white,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
  },
}));

const SignUpLink = styled(RouterLink)(({ theme }) => ({
  color: '#D97706',
  fontSize: '0.875rem',
  textDecoration: 'none',
  marginLeft: theme.spacing(2),
  fontFamily: 'Poppins, Roboto, sans-serif',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: alpha('#182038', 0.98),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    borderRadius: '12px',
    marginTop: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    minWidth: '250px',
  },
  '& .MuiMenuItem-root': {
    fontFamily: 'Poppins, Roboto, sans-serif',
    color: alpha(theme.palette.common.white, 0.85),
    padding: '12px 24px',
    transition: 'all 0.2s ease',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '0%',
      height: '2px',
      bottom: 4,
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#D97706',
      transition: 'width 0.3s ease',
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.05),
      color: '#D97706',
      '&::after': {
        width: 'calc(100% - 48px)',
      },
    },
  },
}));

export const NAVBAR_HEIGHT = 72;

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isLoading } = useTokenForgeAuth();
  const { isConnected, isCorrectNetwork, connect } = useWalletStatus();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuAnchor, setServicesMenuAnchor] = useState<null | HTMLElement>(null);
  const [communityMenuAnchor, setCommunityMenuAnchor] = useState<null | HTMLElement>(null);

  const handleServicesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setServicesMenuAnchor(event.currentTarget);
  };

  const handleCommunityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCommunityMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setServicesMenuAnchor(null);
    setCommunityMenuAnchor(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: `linear-gradient(to right, rgba(24, 32, 56, 0.95), rgba(30, 41, 67, 0.95))`,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        height: NAVBAR_HEIGHT,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, height: '100%' }}>
        {/* Logo */}
        <StyledRouterLink to="/">
          <LogoContainer>
            <TokenForgeLogo />
          </LogoContainer>
        </StyledRouterLink>

        {/* Mobile Menu Icon */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileMenuToggle}
            sx={{ ml: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Desktop Menu */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NavButton
              component={RouterLink}
              to="/plans"
            >
              Plans & Tarifs
            </NavButton>

            <NavButton onClick={handleServicesMenuOpen}>
              Services {servicesMenuAnchor ? <ExpandLess sx={{ ml: 0.5 }} /> : <ExpandMore sx={{ ml: 0.5 }} />}
            </NavButton>

            <NavButton onClick={handleCommunityMenuOpen}>
              Communauté {communityMenuAnchor ? <ExpandLess sx={{ ml: 0.5 }} /> : <ExpandMore sx={{ ml: 0.5 }} />}
            </NavButton>

            {/* Wallet Status */}
            <Chip
              icon={<FiberManualRecordIcon sx={{ color: isCorrectNetwork ? theme.palette.success.main : theme.palette.error.main, width: 10, height: 10 }} />}
              label={isCorrectNetwork ? 'Connecté' : 'Mauvais Réseau'}
              variant="outlined"
              sx={{
                ml: 2,
                borderColor: 'transparent',
                bgcolor: alpha(theme.palette.common.white, 0.05),
                fontFamily: 'Poppins, Roboto, sans-serif',
                height: 32,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ConnectButton
                variant="outlined"
                onClick={connect}
                $loading={isLoading}
                startIcon={isLoading && <CircularProgress size={20} />}
              >
                {isLoading ? 'Connexion...' : 'Connecter Wallet'}
              </ConnectButton>
            </Box>
          </Box>
        )}

        {/* Services Menu */}
        <StyledMenu
          anchorEl={servicesMenuAnchor}
          open={Boolean(servicesMenuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {services.map((item) => (
            <MenuItem
              key={item.name}
              component={RouterLink}
              to={item.href}
              onClick={handleMenuClose}
            >
              <FiberManualRecordIcon sx={{ fontSize: 8, color: '#D97706' }} />
              {item.name}
            </MenuItem>
          ))}
        </StyledMenu>

        {/* Community Menu */}
        <StyledMenu
          anchorEl={communityMenuAnchor}
          open={Boolean(communityMenuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {community.map((item) => (
            <MenuItem
              key={item.name}
              component={item.external ? 'a' : RouterLink}
              to={!item.external ? item.href : undefined}
              href={item.external ? item.href : undefined}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              onClick={handleMenuClose}
            >
              <FiberManualRecordIcon sx={{ fontSize: 8, color: '#D97706' }} />
              {item.name}
            </MenuItem>
          ))}
        </StyledMenu>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileMenuOpen}
          onClose={handleMobileMenuToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              bgcolor: alpha('#182038', 0.98),
              backdropFilter: 'blur(12px)',
              boxShadow: '-4px 0 32px rgba(0, 0, 0, 0.2)',
              '& .MuiListItem-root': {
                fontFamily: 'Poppins, Roboto, sans-serif',
                color: alpha(theme.palette.common.white, 0.85),
                py: 1.5,
                px: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#D97706',
                  bgcolor: alpha(theme.palette.common.white, 0.05),
                },
              },
              '& .MuiListItemText-primary': {
                fontFamily: 'Poppins, Roboto, sans-serif',
              },
            },
          }}
        >
          <List sx={{ pt: 2 }}>
            <ListItem 
              component={RouterLink} 
              to="/plans" 
              onClick={handleMobileMenuToggle}
              button
            >
              <ListItemText primary="Plans & Tarifs" />
            </ListItem>

            <ListItem button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <ListItemText primary="Services" />
              {mobileMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={mobileMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {services.map((item) => (
                  <ListItem
                    key={item.name}
                    button
                    sx={{ 
                      pl: 4,
                      '&:hover': {
                        color: '#D97706',
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                      },
                    }}
                    component={RouterLink}
                    to={item.href}
                    onClick={handleMobileMenuToggle}
                  >
                    <ListItemText 
                      primary={item.name}
                      primaryTypographyProps={{
                        sx: { fontSize: '0.9rem' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>

            <ListItem button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <ListItemText primary="Communauté" />
              {mobileMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={mobileMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {community.map((item) => (
                  <ListItem
                    key={item.name}
                    button
                    sx={{ 
                      pl: 4,
                      '&:hover': {
                        color: '#D97706',
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                      },
                    }}
                    component={RouterLink}
                    to={item.href}
                    onClick={handleMobileMenuToggle}
                  >
                    <ListItemText 
                      primary={item.name}
                      primaryTypographyProps={{
                        sx: { fontSize: '0.9rem' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>

            <ListItem
              component={RouterLink}
              to={isAuthenticated ? "/dashboard" : "/login"}
              onClick={handleMobileMenuToggle}
              button
              sx={{
                mt: 2,
                color: '#D97706',
                borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              }}
            >
              <ListItemText primary={isAuthenticated ? 'Dashboard' : 'Connexion'} />
            </ListItem>
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};
