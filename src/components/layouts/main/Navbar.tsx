import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
  Typography,
  Grid,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HexagonIcon from '@mui/icons-material/Hexagon';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import WebIcon from '@mui/icons-material/Web';
import WaterIcon from '@mui/icons-material/Water';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';
import HighlightIcon from '@mui/icons-material/Highlight';
import GavelIcon from '@mui/icons-material/Gavel';
import TokenIcon from '@mui/icons-material/Token';

const services = [
  { name: 'Création de Launchpad (IDO)', href: '/services/launchpad', icon: <WebIcon sx={{ color: '#F59E0B', fontSize: 20 }} /> },
  { name: 'Création de plateforme de Staking', href: '/services/staking', icon: <TokenIcon sx={{ color: '#F59E0B', fontSize: 20 }} /> },
  { name: 'Assistance Marketing et Listing', href: '/services/marketing', icon: <HighlightIcon sx={{ color: '#F59E0B', fontSize: 20 }} /> },
  { name: 'KYC (Know Your Customer)', href: '/services/kyc', icon: <ShieldIcon sx={{ color: '#F59E0B', fontSize: 20 }} /> },
];

const community = [
  { name: 'Blog', href: '/blog' },
  { name: 'Documentation', href: '/docs' },
  { name: 'Discord', href: 'https://discord.gg/tokenforge', external: true },
  { name: 'Telegram', href: 'https://t.me/tokenforge', external: true },
  { name: 'Twitter', href: 'https://twitter.com/tokenforge', external: true },
];

const glowAnimation = keyframes`
  0% { filter: brightness(1) drop-shadow(0 0 0px rgba(245, 158, 11, 0)); }
  50% { filter: brightness(1.2) drop-shadow(0 0 8px rgba(245, 158, 11, 0.4)); }
  100% { filter: brightness(1) drop-shadow(0 0 0px rgba(245, 158, 11, 0)); }
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
  fontFamily: '"Space Grotesk", "Poppins", sans-serif',
  fontWeight: 500,
  position: 'relative',
  textTransform: 'none',
  opacity: $loading ? 0.7 : 1,
  pointerEvents: $loading ? 'none' : 'auto',
  transition: 'all 0.2s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '0%',
    height: '2px',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#F59E0B',
    transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  '&:hover': {
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)',
    '&::after': {
      width: '80%',
    },
  },
  '&.active': {
    color: '#FFFFFF',
    '&::after': {
      width: '100%',
    },
    boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
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
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, loading: isLoading } = useTokenForgeAuth();
  const { isCorrectNetwork, connect } = useWalletStatus();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const [servicesMenuAnchor, setServicesMenuAnchor] = useState<null | HTMLElement>(null);
  const [communityMenuAnchor, setCommunityMenuAnchor] = useState<null | HTMLElement>(null);
  const [createTokenMenuAnchor, setCreateTokenMenuAnchor] = useState<null | HTMLElement>(null);

  const handleServicesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setServicesMenuAnchor(event.currentTarget);
  };

  const handleCommunityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCommunityMenuAnchor(event.currentTarget);
  };

  const handleCreateTokenMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCreateTokenMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setServicesMenuAnchor(null);
    setCommunityMenuAnchor(null);
    setCreateTokenMenuAnchor(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: `linear-gradient(to right, rgba(24, 32, 56, 0.95), rgba(30, 41, 67, 0.95))`,
        backgroundImage: `
          linear-gradient(to right, rgba(24, 32, 56, 0.95), rgba(30, 41, 67, 0.95)),
          url('/images/circuit-pattern.svg')
        `,
        backgroundSize: 'cover, 400px',
        backgroundBlendMode: 'normal, overlay',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        height: NAVBAR_HEIGHT,
        borderBottom: '1px solid',
        borderColor: 'rgba(71, 85, 105, 0.15)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, height: '100%' }}>
        {/* Logo with Tagline */}
        <StyledRouterLink to="/">
          <LogoContainer>
            <TokenForgeLogo />
          </LogoContainer>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              ml: 1.5,
              pl: 1.5,
              borderLeft: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 300,
                color: 'rgba(248, 250, 252, 0.8)',
                letterSpacing: '0.02em'
              }}
            >
              Forge Your Token Future
            </Typography>
          </Box>
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
              to="/create-token"
              onClick={handleCreateTokenMenuOpen}
              aria-haspopup="true"
              aria-expanded={Boolean(createTokenMenuAnchor)}
              className={location.pathname.startsWith('/create-token') ? 'active' : ''}
            >
              Créer un Token {createTokenMenuAnchor ? <ExpandLess sx={{ ml: 0.5 }} /> : <ExpandMore sx={{ ml: 0.5 }} />}
            </NavButton>

            <NavButton
              component={RouterLink}
              to="/tokenomics"
              className={location.pathname.startsWith('/tokenomics') ? 'active' : ''}
              aria-current={location.pathname.startsWith('/tokenomics') ? 'page' : undefined}
            >
              Tokenomics
            </NavButton>

            <NavButton
              onClick={handleServicesMenuOpen}
              aria-haspopup="true"
              aria-expanded={Boolean(servicesMenuAnchor)}
            >
              Services {servicesMenuAnchor ? <ExpandLess sx={{ ml: 0.5 }} /> : <ExpandMore sx={{ ml: 0.5 }} />}
            </NavButton>

            <NavButton
              component={RouterLink}
              to="/comparator"
              className={location.pathname.startsWith('/comparator') ? 'active' : ''}
              aria-current={location.pathname.startsWith('/comparator') ? 'page' : undefined}
            >
              Comparateur
            </NavButton>

            <NavButton onClick={handleCommunityMenuOpen}
              aria-haspopup="true"
              aria-expanded={Boolean(communityMenuAnchor)}
            >
              Communauté {communityMenuAnchor ? <ExpandLess sx={{ ml: 0.5 }} /> : <ExpandMore sx={{ ml: 0.5 }} />}
            </NavButton>

            <NavButton
              component={RouterLink}
              to="/resources"
              className={location.pathname.startsWith('/resources') ? 'active' : ''}
              aria-current={location.pathname.startsWith('/resources') ? 'page' : undefined}
            >
              Ressources
            </NavButton>

            <NavButton
              component={RouterLink}
              to="/plans"
              className={location.pathname.startsWith('/plans') ? 'active' : ''}
              aria-current={location.pathname.startsWith('/plans') ? 'page' : undefined}
            >
              Plans & Tarifs
            </NavButton>

            {/* Right Zone Elements */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              {/* Blockchain Selector */}
              <IconButton
                color="inherit"
                aria-label="select blockchain"
                sx={{
                  position: 'relative',
                  mr: 1.5,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                }}
              >
                <HexagonIcon sx={{ color: '#3498db', fontSize: 28 }} />
                <Box
                  sx={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isCorrectNetwork ? 'success.main' : 'error.main',
                    bottom: 12,
                    right: 12,
                    border: '1px solid',
                    borderColor: 'background.paper'
                  }}
                />
              </IconButton>

              {/* Search */}
              <IconButton
                color="inherit"
                aria-label="search the site"
                sx={{ mr: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
              >
                <SearchIcon />
              </IconButton>

              {/* User Account */}
              <IconButton
                color="inherit"
                aria-label="account"
                sx={{ mr: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
              >
                <AccountCircleIcon />
              </IconButton>

              {/* CTA Principal */}
              <Button
                variant="contained"
                component={RouterLink}
                to="/create-token"
                sx={{
                  mr: 2,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  background: 'linear-gradient(45deg, #F59E0B 0%, #EA580C 100%)',
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #F59E0B 30%, #EA580C 90%)',
                    boxShadow: '0 6px 12px rgba(245, 158, 11, 0.4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Forge ton Token
              </Button>

              {/* Wallet Status */}
              <Chip
                icon={<FiberManualRecordIcon sx={{ color: isCorrectNetwork ? theme.palette.success.main : theme.palette.error.main, width: 10, height: 10 }} />}
                label={isCorrectNetwork ? 'Connecté' : 'Mauvais Réseau'}
                variant="outlined"
                sx={{
                  borderColor: 'transparent',
                  bgcolor: alpha(theme.palette.common.white, 0.05),
                  fontFamily: '"Space Grotesk", sans-serif',
                  height: 32,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <ConnectButton
                  variant="outlined"
                  onClick={() => {
                    // Call connect with dummy values since we can't get them from the event
                    // In a real implementation, these would come from elsewhere
                    connect('0x0', 1);
                  }}
                  $loading={isLoading}
                  startIcon={isLoading && <CircularProgress size={20} />}
                >
                  {isLoading ? 'Connexion...' : 'Connecter Wallet'}
                </ConnectButton>
              </Box>
            </Box>
          </Box>
        )}

        {/* Services Mega Menu */}
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
          sx={{
            '& .MuiPaper-root': {
              width: 640,
              p: 3,
              mt: 1.5
            }
          }}
        >
          <Grid container spacing={2}>
            {/* Tokenomics Designer */}
            <Grid item xs={6} md={4}>
              <Box sx={{ p: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InsertChartIcon sx={{ color: '#F59E0B', mr: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Tokenomics Designer
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Concevez l'économie parfaite pour votre token
                </Typography>
              </Box>
            </Grid>

            {/* Landing Page Builder */}
            <Grid item xs={6} md={4}>
              <Box sx={{ p: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WebIcon sx={{ color: '#F59E0B', mr: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Landing Page Builder
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Créez une vitrine professionnelle sans coder
                </Typography>
              </Box>
            </Grid>

            {/* Auto-Liquidity Manager */}
            <Grid item xs={6} md={4}>
              <Box sx={{ p: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WaterIcon sx={{ color: '#F59E0B', mr: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Auto-Liquidity Manager
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Gestion automatisée de la liquidité multi-DEX
                </Typography>
              </Box>
            </Grid>

            {/* Anti-Rugpull Protection */}
            <Grid item xs={6} md={4}>
              <Box sx={{ p: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShieldIcon sx={{ color: '#F59E0B', mr: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Anti-Rugpull Protection
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Sécurisez votre projet avec des mécanismes de confiance
                </Typography>
              </Box>
            </Grid>

            {/* Expert Network */}
            <Grid item xs={6} md={4}>
              <Box sx={{ p: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ color: '#F59E0B', mr: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Expert Network
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Accédez à notre réseau d'experts vérifiés
                </Typography>
              </Box>
            </Grid>

            {/* Token Spotlight */}
            <Grid item xs={6} md={4}>
              <Box sx={{ p: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HighlightIcon sx={{ color: '#F59E0B', mr: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Token Spotlight
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Mettez en valeur votre projet auprès de notre communauté
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </StyledMenu>

        {/* Create Token Dropdown */}
        <StyledMenu
          anchorEl={createTokenMenuAnchor}
          open={Boolean(createTokenMenuAnchor)}
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
          <Box sx={{ p: 2, minWidth: 280 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 400 }}>
              Choisissez votre blockchain
            </Typography>

            {/* Ethereum */}
            <MenuItem sx={{ py: 1.5, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(98, 126, 234, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <img src="/images/ethereum.svg" alt="Ethereum" width={20} height={20} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">Ethereum</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mr: 1 }}>
                      Complexité:
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <GavelIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                      <GavelIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                      <GavelIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.3)' }} />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.5)' }}>
                  <Typography variant="caption">~3 min</Typography>
                </Box>
              </Box>
            </MenuItem>

            {/* Binance Smart Chain */}
            <MenuItem sx={{ py: 1.5, borderRadius: 1, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(243, 186, 47, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <img src="/images/binance.svg" alt="Binance" width={20} height={20} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">Binance Smart Chain</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mr: 1 }}>
                      Complexité:
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <GavelIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                      <GavelIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.3)' }} />
                      <GavelIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.3)' }} />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.5)' }}>
                  <Typography variant="caption">~2 min</Typography>
                </Box>
              </Box>
            </MenuItem>

            {/* Polygon */}
            <MenuItem sx={{ py: 1.5, borderRadius: 1, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(130, 71, 229, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <img src="/images/polygon.svg" alt="Polygon" width={20} height={20} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">Polygon</Typography>
