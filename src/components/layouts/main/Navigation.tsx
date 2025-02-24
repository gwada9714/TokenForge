import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { Link as RouterLink } from 'react-router-dom';
import { CustomConnectButton } from '../ConnectWallet/CustomConnectButton';
import { NetworkStatus } from '../Network/NetworkStatus';
import { sepolia } from 'viem/chains';

const Navigation: React.FC = () => {
  const { 
    isOwner,
    networkStatus,
    isLoading
  } = useTokenForgeAdmin();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'primary.dark',
        mb: 2
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/"
          sx={{ 
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          TokenForge
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Statut du réseau et bouton de connexion */}
          <NetworkStatus preferredChain={sepolia} />
          <CustomConnectButton />

          {/* Afficher les autres boutons seulement si connecté */}
          {networkStatus.isConnected && networkStatus.isCorrectNetwork && !isLoading && (
            <>
              <Button color="inherit" component={RouterLink} to="/create">
                Créer un Token
              </Button>
              <Button color="inherit" component={RouterLink} to="/my-tokens">
                Mes Tokens
              </Button>
              <Button color="inherit" component={RouterLink} to="/staking">
                Staking
              </Button>
              <Button color="inherit" component={RouterLink} to="/profit">
                Profits
              </Button>
              {isOwner && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/admin"
                  sx={{ 
                    backgroundColor: 'warning.main',
                    '&:hover': {
                      backgroundColor: 'warning.dark'
                    }
                  }}
                >
                  Admin
                </Button>
              )}
            </>
          )}

          {/* Afficher le loader pendant le chargement */}
          {isLoading && (
            <CircularProgress 
              size={24} 
              sx={{ color: 'common.white' }} 
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
