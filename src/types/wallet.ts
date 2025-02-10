import { WalletClient } from 'viem';

export interface WalletState {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  address: string | null;
  chainId: number | null;
  walletClient: WalletClient | null;
}

export interface WalletCallbacks {
  onConnect: (address: string, chainId: number) => void;
  onDisconnect: () => void;
  onNetworkChange: (chainId: number) => void;
  onWalletStateSync: (newState: Partial<WalletState>) => void;
  onError: (error: unknown) => void;
}
