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
  { name: 'Discord', href: 'https://discord.gg/tokenforge' },
  { name: 'Telegram', href: 'https://t.me/tokenforge' },
  { name: 'Twitter', href: 'https://twitter.com/tokenforge' },
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
}

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => !['component', 'to'].includes(prop as string),
})<NavButtonProps>(({ theme }) => ({
  color: alpha(theme.palette.common.white, 0.85),
  marginLeft: theme.spacing(2),
  fontFamily: 'Poppins, Roboto, sans-serif',
  fontWeight: 400,
  position: 'relative',
  textTransform: 'none',
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
  shouldForwardProp: (prop) => !['component', 'to'].includes(prop as string),
})<NavButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderColor: '#D97706',
  color: '#D97706',
  borderRadius: '8px',
  padding: '8px 24px',
  fontFamily: 'Poppins, Roboto, sans-serif',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
    color: theme.palette.common.white,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
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
  },
  '& .MuiMenuItem-root': {
    fontFamily: 'Poppins, Roboto, sans-serif',
    color: alpha(theme.palette.common.white, 0.85),
    padding: '10px 24px',
    transition: 'all 0.2s ease',
    position: 'relative',
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

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesAnchor, setServicesAnchor] = useState<null | HTMLElement>(null);
  const [communityAnchor, setCommunityAnchor] = useState<null | HTMLElement>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);

  const { state } = useTokenForgeAuth();
  const { wallet, isConnected, isCorrectNetwork } = useWalletStatus();

  const getWalletStatusColor = () => {
    if (!isConnected) return theme.palette.error.main;
    if (!isCorrectNetwork) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getWalletStatusText = () => {
    if (!isConnected) return 'Wallet non connecté';
    if (!isCorrectNetwork) return 'Mauvais réseau';
    return wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Connecté';
  };

  const handleServicesClick = (event: React.MouseEvent<HTMLElement>) => {
    setServicesAnchor(event.currentTarget);
  };

  const handleCommunityClick = (event: React.MouseEvent<HTMLElement>) => {
    setCommunityAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setServicesAnchor(null);
    setCommunityAnchor(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: `linear-gradient(to right, rgba(24, 32, 56, 0.95), rgba(30, 41, 67, 0.95))`,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
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
            onClick={handleDrawerToggle}
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
              to="/tokens/create"
            >
              Créer un Token
            </NavButton>

            <NavButton onClick={handleServicesClick}>
              Services {Boolean(servicesAnchor) ? <ExpandLess sx={{ ml: 0.5 }} /> : <ExpandMore sx={{ ml: 0.5 }} />}
            </NavButton>

            <NavButton
              component={RouterLink}
              to="/tokens"
            >
              Token $TKN
            </NavButton>

            <NavButton onClick={handleCommunityClick}>
              Communauté {Boolean(communityAnchor) ? <ExpandLess sx={{ ml: 0.5 }} /> : <ExpandMore sx={{ ml: 0.5 }} />}
            </NavButton>

            {/* Wallet Status */}
            <Chip
              icon={<FiberManualRecordIcon sx={{ color: getWalletStatusColor(), width: 10, height: 10 }} />}
              label={getWalletStatusText()}
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

            {/* Auth Button */}
            {isConnected ? (
              <ConnectButton
                component={RouterLink}
                to={state.isAuthenticated ? "/dashboard" : "/login"}
                variant="outlined"
              >
                {state.isAuthenticated ? 'Dashboard' : 'Connexion'}
              </ConnectButton>
            ) : (
              <ConnectButton
                component={RouterLink}
                to="/connect-wallet"
                variant="outlined"
              >
                Connecter Wallet
              </ConnectButton>
            )}
          </Box>
        )}

        {/* Services Dropdown */}
        <StyledMenu
          anchorEl={servicesAnchor}
          open={Boolean(servicesAnchor)}
          onClose={handleClose}
          MenuListProps={{ 'aria-labelledby': 'services-button' }}
        >
          {services.map((item) => (
            <MenuItem
              key={item.name}
              component={RouterLink}
              to={item.href}
              onClick={handleClose}
            >
              {item.name}
            </MenuItem>
          ))}
        </StyledMenu>

        {/* Community Dropdown */}
        <StyledMenu
          anchorEl={communityAnchor}
          open={Boolean(communityAnchor)}
          onClose={handleClose}
          MenuListProps={{ 'aria-labelledby': 'community-button' }}
        >
          {community.map((item) => (
            <MenuItem
              key={item.name}
              component={RouterLink}
              to={item.href}
              onClick={handleClose}
            >
              {item.name}
            </MenuItem>
          ))}
        </StyledMenu>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
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
              to="/tokens/create" 
              onClick={handleDrawerToggle}
              button
            >
              <ListItemText primary="Créer un Token" />
            </ListItem>

            <ListItem button onClick={() => setMobileServicesOpen(!mobileServicesOpen)}>
              <ListItemText primary="Services" />
              {mobileServicesOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
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
                    onClick={handleDrawerToggle}
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
              to="/tokens" 
              onClick={handleDrawerToggle}
              button
            >
              <ListItemText primary="Token $TKN" />
            </ListItem>

            <ListItem button onClick={() => setMobileCommunityOpen(!mobileCommunityOpen)}>
              <ListItemText primary="Communauté" />
              {mobileCommunityOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={mobileCommunityOpen} timeout="auto" unmountOnExit>
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
                    onClick={handleDrawerToggle}
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
              to={state.isAuthenticated ? "/dashboard" : "/login"}
              onClick={handleDrawerToggle}
              button
              sx={{
                mt: 2,
                color: '#D97706',
                borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              }}
            >
              <ListItemText primary={state.isAuthenticated ? 'Dashboard' : 'Connexion'} />
            </ListItem>
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
