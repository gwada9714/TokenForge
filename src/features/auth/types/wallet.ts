import { WalletClient } from 'viem';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  walletClient: WalletClient | null;
}

export interface WalletService {
  connect: () => Promise<WalletState>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}

export interface WalletReconnectionService {
  getWalletState: () => WalletState;
  attemptReconnection: () => Promise<boolean>;
  cleanup: () => void;
}
