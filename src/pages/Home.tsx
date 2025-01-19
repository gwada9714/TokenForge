import React from 'react';
import { Layout } from '../components/Layout';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { CustomConnectButton } from '../components/ConnectWallet/CustomConnectButton';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';
import { LockOpen as LockOpenIcon } from '@mui/icons-material';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isConnected,
    isCorrectNetwork,
    network: {
      currentNetwork,
      isMainnet
    }
  } = useWeb3();

  const handleGetStarted = () => {
    navigate('/create');
  };

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
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Bienvenue sur TokenForge
          </Typography>
          
          {!isConnected ? (
            <>
              <Typography variant="h5" gutterBottom align="center">
                Connectez votre wallet pour commencer
              </Typography>
              <Box sx={{ mt: 2 }}>
                <CustomConnectButton />
              </Box>
            </>
          ) : (
            <Paper 
              elevation={3}
              sx={{
                p: 4,
                mt: 4,
                width: '100%',
                maxWidth: 600,
                textAlign: 'center'
              }}
            >
              {isCorrectNetwork ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Vous êtes connecté sur {currentNetwork}
                    {isMainnet ? ' (Mainnet)' : ' (Testnet)'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Vous pouvez maintenant créer et gérer vos tokens
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    startIcon={<LockOpenIcon />}
                  >
                    Commencer
                  </Button>
                </>
              ) : (
                <Box sx={{ width: '100%' }}>
                  <CustomConnectButton />
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default Home;