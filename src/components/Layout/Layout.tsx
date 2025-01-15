import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Header from '../Header';
import Footer from '../Footer/Footer';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const menuItems = [
    { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/' },
    { text: 'Créer un Token', icon: <AddCircleIcon />, path: '/create' },
    { text: 'Staking TKN', icon: <AccountBalanceIcon />, path: '/staking' },
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: isDarkMode ? 'grey.900' : 'grey.50',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Header menuItems={menuItems} />
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