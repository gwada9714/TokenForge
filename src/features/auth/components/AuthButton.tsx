import React, { useCallback } from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuthManager } from '../hooks/useAuthManager';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { SupportedChainId, FirebaseAuthState } from '../../../types/common';
import { shortenAddress } from '../../../utils/address';
import { toast } from 'react-hot-toast';
import { SUPPORTED_CHAINS } from '../../../types/common';

declare global {
  interface Window {
    ethereum?: {
      chainId: string;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

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
    switchNetwork,
  } = useAuthManager(requiredChainId);

  const {
    session,
    isLoading: isConnectingFirebase,
    signInWithWallet,
    signOut: signOutFirebase,
  } = useFirebaseAuth();

  const handleNetworkSwitch = useCallback(async (targetChainId: number) => {
    try {
      await switchNetwork(targetChainId);
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Échec du changement de réseau');
      return false;
    }
  }, [switchNetwork]);

  const handleClick = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask n\'est pas installé');
      }

      if (session) {
        // Si connecté à Firebase, déconnexion complète
        await signOutFirebase();
        disconnectWallet();
        toast.success('Déconnexion réussie');
      } else if (account) {
        // Si wallet connecté mais pas Firebase, connexion Firebase
        try {
          await signInWithWallet();
          toast.success('Connexion à Firebase réussie');
        } catch (error) {
          console.error('Failed to sign in with wallet:', error);
          throw new Error('Échec de la connexion à Firebase');
        }
      } else {
        // Vérification du réseau avant la connexion
        const chainId = parseInt(window.ethereum.chainId, 16);
        
        if (requiredChainId && chainId !== requiredChainId) {
          const networkSwitched = await handleNetworkSwitch(requiredChainId);
          if (!networkSwitched) {
            throw new Error(`Veuillez vous connecter au réseau ${SUPPORTED_CHAINS[requiredChainId]}`);
          }
        }
        
        // Si rien n'est connecté, connexion wallet
        const connected = await connectWallet();
        if (connected) {
          try {
            // Connexion automatique à Firebase après connexion wallet
            await signInWithWallet();
            toast.success('Connexion réussie');
          } catch (error) {
            console.error('Failed to sign in with wallet after connect:', error);
            throw new Error('Échec de la connexion à Firebase après connexion du wallet');
          }
        } else {
          throw new Error('Échec de la connexion du wallet');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const getButtonText = () => {
    if (isConnectingWallet || isConnectingFirebase) return 'Connexion en cours...';
    if (isChangingNetwork) return 'Changement de réseau...';
    if (walletError) return 'Erreur de connexion';
    if (session) return shortenAddress(session.uid);
    if (account) return 'Compléter la connexion';
    return 'Connecter le wallet';
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
