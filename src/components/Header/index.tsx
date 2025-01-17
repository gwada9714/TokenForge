import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useAccount } from 'wagmi';
import { AuthButtons } from "../../components/auth/AuthButtons";

const Header: React.FC = () => {
  const theme = useTheme();
  const { isAdmin } = useTokenForgeAdmin();
  const { isConnected } = useAccount();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: "Accueil", path: "/" },
    { text: "Créer un Token", path: "/create" },
    { text: "Mes Tokens", path: "/my-tokens" },
    { text: "Plans & Tarifs", path: "/pricing" },
    { text: "Staking", path: "/staking" },
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 5 },
              color: 'text.primary',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            TokenForge
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                color="inherit"
              >
                {item.text}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AuthButtons />
            <ConnectButton />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;