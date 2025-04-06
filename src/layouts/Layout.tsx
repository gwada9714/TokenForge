// @ts-expect-error React is needed for JSX
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar, NAVBAR_HEIGHT } from '../components/layouts/main/Navbar';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { useTokenForgeAuth } from '@/hooks/useAuth';

export const Layout = () => {
  const { isAuthenticated } = useTokenForgeAuth();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'grid',
        gridTemplateAreas: {
          xs: `
            "nav"
            "main"
            "footer"
          `,
          md: isAuthenticated ? `
            "nav nav"
            "sidebar main"
            "footer footer"
          ` : `
            "nav nav"
            "main main"
            "footer footer"
          `
        },
        gridTemplateColumns: {
          xs: '1fr',
          md: isAuthenticated ? 'auto 1fr' : '1fr'
        },
        gridTemplateRows: `${NAVBAR_HEIGHT}px 1fr auto`
      }}
    >
      <Box sx={{ gridArea: 'nav', position: 'sticky', top: 0, zIndex: 1200 }}>
        <Navbar />
      </Box>

      {isAuthenticated && (
        <Box sx={{ gridArea: 'sidebar' }}>
          <Sidebar />
        </Box>
      )}

      <Box 
        component="main" 
        sx={{ 
          gridArea: 'main',
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: 'background.default',
          minHeight: '100%',
          width: '100%'
        }}
      >
        <Outlet />
      </Box>

      <Box sx={{ gridArea: 'footer' }}>
        <Footer />
      </Box>
    </Box>
  );
};
