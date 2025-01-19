import React from 'react';
import { Box, AppBar, Toolbar, Container, useTheme } from '@mui/material';
import { CustomConnectButton } from './ConnectWallet/CustomConnectButton';
import { NetworkStatus } from './Network/NetworkStatus';
import { SUPPORTED_NETWORKS } from '../config/networks';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Logo ou titre ici */}
          </Box>
          
          {/* Statut du réseau et bouton de connexion */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NetworkStatus preferredNetwork={SUPPORTED_NETWORKS.SEPOLIA} />
            <CustomConnectButton />
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        component="main" 
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: 4,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Container maxWidth="lg">
          {/* Contenu du footer ici */}
        </Container>
      </Box>
    </Box>
  );
};
