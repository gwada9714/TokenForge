import { useTokenForgeAuth } from './useTokenForgeAuth';
import { WalletState } from '../types/auth';
import { WalletClient } from 'viem';

export function useWalletStatus(): {
  wallet: WalletState | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  address: `0x${string}` | null;
  connect: (address: string, chainId: number, walletClient: WalletClient) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
} {
  const { wallet, isInitialized, loading, connectWallet, disconnectWallet } = useTokenForgeAuth();

  // Si l'état n'est pas encore initialisé ou en cours de chargement, retourner un état par défaut
  if (!isInitialized || loading) {
    return {
      wallet: null,
      isConnected: false,
      isCorrectNetwork: false,
      address: null,
      connect: connectWallet,
      disconnect: disconnectWallet,
      switchNetwork: async (chainId: number) => {
        console.warn('Cannot switch network while loading or not initialized');
      }
    };
  }

  // Utiliser une valeur par défaut si wallet est undefined
  const walletState = wallet ?? {
    address: null,
    isConnected: false,
    isCorrectNetwork: false,
    chainId: undefined,
    walletClient: undefined
  };

  return {
    wallet: walletState,
    isConnected: Boolean(walletState.address),
    isCorrectNetwork: Boolean(walletState.isCorrectNetwork),
    address: walletState.address,
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchNetwork: async (chainId: number) => {
      console.warn('Network switching not implemented');
    }
  };
}
