import { useCallback, useEffect } from 'react';
import { WalletClientType } from '../types';
import { mainnet, sepolia } from '../../../config/chains';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { walletReconnectionService } from '../services/walletReconnectionService';
import { useTokenForgeAuth } from './useTokenForgeAuth';
import { authActions } from '../actions/authActions';
import { TokenForgeAuthContext } from '../context/TokenForgeAuthContext';
import { useContext } from 'react';

function getNetworkName(chainId: number): string {
  switch (chainId) {
    case mainnet.id:
      return 'Ethereum Mainnet';
    case sepolia.id:
      return 'Sepolia Testnet';
    default:
      return `Réseau ${chainId}`;
  }
}

function isCorrectChainId(chainId: number): boolean {
  return chainId === mainnet.id || chainId === sepolia.id;
}

export function useWalletState() {
  const auth = useTokenForgeAuth();
  const context = useContext(TokenForgeAuthContext);
  if (!context) throw new Error('useWalletState must be used within TokenForgeAuthProvider');
  const { dispatch } = context;
  const { walletState } = auth;

  const connectWallet = useCallback((
    address: string,
    chainId: number,
    walletClient: WalletClientType | null,
    provider: any
  ) => {
    if (!walletClient) return;
    
    dispatch(authActions.connectWallet({
      isConnected: true,
      address,
      chainId,
      walletClient,
      provider,
      isCorrectNetwork: isCorrectChainId(chainId)
    }));

    notificationService.notifyWalletConnected(address);

    if (!isCorrectChainId(chainId)) {
      const currentNetwork = getNetworkName(chainId);
      const expectedNetworks = [
        getNetworkName(mainnet.id),
        getNetworkName(sepolia.id),
      ].join(' ou ');
      
      notificationService.notifyWrongNetwork(currentNetwork, expectedNetworks);
    }

    storageService.saveWalletState({
      address,
      chainId,
      isConnected: true,
      isCorrectNetwork: isCorrectChainId(chainId)
    });
  }, [dispatch]);

  const disconnectWallet = useCallback(() => {
    dispatch(authActions.disconnectWallet());
    notificationService.notifyWalletDisconnected();
    storageService.clearWalletState();
  }, [dispatch]);

  const updateNetwork = useCallback((chainId: number) => {
    dispatch(authActions.updateNetwork(chainId, isCorrectChainId(chainId)));

    if (!isCorrectChainId(chainId)) {
      const currentNetwork = getNetworkName(chainId);
      const expectedNetworks = [
        getNetworkName(mainnet.id),
        getNetworkName(sepolia.id),
      ].join(' ou ');
      
      notificationService.notifyWrongNetwork(currentNetwork, expectedNetworks);
    }
  }, [dispatch]);

  const updateProvider = useCallback((provider: any) => {
    dispatch(authActions.updateProvider(provider));
  }, [dispatch]);

  useEffect(() => {
    const cleanup = walletReconnectionService.initialize({
      onConnect: connectWallet,
      onDisconnect: disconnectWallet,
      onNetworkChange: updateNetwork,
      onProviderChange: updateProvider
    });

    return cleanup;
  }, [connectWallet, disconnectWallet, updateNetwork, updateProvider]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    updateNetwork,
    updateProvider
  };
}
