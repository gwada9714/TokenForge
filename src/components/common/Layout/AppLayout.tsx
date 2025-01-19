import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, useTheme, useMediaQuery } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { NetworkStatus } from '@/components/Network/NetworkStatus';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <SnackbarProvider maxSnack={3}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              TokenForge
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <NetworkStatus compact={isMobile} />
            </Box>
          </Toolbar>
        </AppBar>
        
        <Navigation />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${240}px)` },
            ml: { sm: `${240}px` },
            mt: '64px',
          }}
        >
          <Container maxWidth="lg">
            {children}
          </Container>
        </Box>
      </Box>
    </SnackbarProvider>
  );
};

export default AppLayout;
