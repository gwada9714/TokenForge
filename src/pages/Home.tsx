import React from 'react';
import { Layout } from '../components/Layout';
import Container from '@mui/material/Container';
import { Box, Typography } from '@mui/material';
import { CustomConnectButton } from '../components/ConnectWallet/CustomConnectButton';

const Home: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            py: 8
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Bienvenue sur TokenForge
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            Connectez votre wallet pour commencer
          </Typography>

          <Box sx={{ mt: 4 }}>
            <CustomConnectButton />
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default Home;