import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAccount } from 'wagmi';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { Link as RouterLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navigation: React.FC = () => {
  const { isConnected } = useAccount();
  const { isAdmin } = useTokenForgeAdmin();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          TokenForge
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isConnected && (
            <>
              <Button color="inherit" component={RouterLink} to="/create">
                Créer un Token
              </Button>
              <Button color="inherit" component={RouterLink} to="/plans">
                Plans
              </Button>
              {isAdmin && (
                <Button color="inherit" component={RouterLink} to="/admin">
                  Admin
                </Button>
              )}
            </>
          )}
          <ConnectButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
