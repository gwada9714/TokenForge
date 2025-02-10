import { useTokenForgeAuth } from '../providers/TokenForgeAuthProvider';
import { WalletState } from '../types/wallet';

export function useWalletStatus(): {
  wallet: WalletState;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
} {
  const { state, actions } = useTokenForgeAuth();
  const { wallet } = state;

  return {
    wallet,
    isConnected: wallet.isConnected,
    isCorrectNetwork: wallet.isCorrectNetwork,
    connect: actions.connectWallet,
    disconnect: actions.disconnectWallet,
    switchNetwork: actions.switchNetwork
  };
}
