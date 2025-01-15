import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Header from '../Header';
import Footer from '../Footer/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: isDarkMode ? 'grey.900' : 'grey.50',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Header />
      <Container 
        maxWidth="xl"
        sx={{
          py: 4,
          px: 2,
          my: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          flex: 1
        }}
      >
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;