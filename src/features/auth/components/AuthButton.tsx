import React from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuthManager } from '../hooks/useAuthManager';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { SupportedChainId } from '../hooks/useNetworkManagement';
import { shortenAddress } from '../../../utils/address';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 2),
  textTransform: 'none',
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
  },
}));

interface AuthButtonProps {
  requiredChainId?: SupportedChainId;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  requiredChainId,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
}) => {
  const {
    isReady,
    isConnecting: isConnectingWallet,
    isChangingNetwork,
    account,
    connect: connectWallet,
    disconnect: disconnectWallet,
    error: walletError,
  } = useAuthManager(requiredChainId);

  const {
    session,
    isLoading: isConnectingFirebase,
    signInWithWallet,
    signOut: signOutFirebase,
  } = useFirebaseAuth();

  const handleClick = async () => {
    if (session) {
      // Si connecté à Firebase, déconnexion complète
      await signOutFirebase();
      disconnectWallet();
    } else if (account) {
      // Si wallet connecté mais pas Firebase, connexion Firebase
      try {
        await signInWithWallet();
      } catch (error) {
        console.error('Failed to sign in with wallet:', error);
      }
    } else {
      // Si rien n'est connecté, connexion wallet
      try {
        const connected = await connectWallet();
        if (connected) {
          // Connexion automatique à Firebase après connexion wallet
          await signInWithWallet();
        }
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    }
  };

  const getButtonText = () => {
    if (isConnectingWallet || isConnectingFirebase) return 'Connecting...';
    if (isChangingNetwork) return 'Switching Network...';
    if (walletError) return 'Connection Error';
    if (session) return shortenAddress(session.uid);
    if (account) return 'Complete Sign In';
    return 'Connect Wallet';
  };

  const getButtonColor = () => {
    if (walletError) return 'error';
    if (isReady && session) return 'success';
    if (isReady) return 'primary';
    return 'primary';
  };

  const isLoading = isConnectingWallet || isConnectingFirebase || isChangingNetwork;

  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      color={getButtonColor()}
      onClick={handleClick}
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <AccountBalanceWalletIcon />
        )
      }
      disabled={isLoading}
    >
      <Typography variant="button" noWrap>
        {getButtonText()}
      </Typography>
    </StyledButton>
  );
};
