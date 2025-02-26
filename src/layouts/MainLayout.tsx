import { Box } from '@mui/material';
import { Navbar } from '../components/layouts/main/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};
