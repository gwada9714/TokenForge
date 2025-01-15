import React from 'react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import Header from '../Header';
import Footer from '../Footer/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const containerBg = useColorModeValue('white', 'gray.800');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Header />
      <Container
        maxW="container.xl"
        py={8}
        px={4}
        bg={containerBg}
        borderRadius="xl"
        boxShadow="lg"
        my={8}
      >
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;