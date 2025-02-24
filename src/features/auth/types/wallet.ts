import { WalletClient } from 'viem';
import { EthereumProvider } from './ethereum';

export interface WalletState {
  isConnected: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  provider: EthereumProvider | null;
}

export interface WalletError {
  code: string;
  message: string;
  details?: unknown;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
}

export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  error?: WalletError;
}

export interface WalletService {
  connect(): Promise<WalletConnectionResult>;
  disconnect(): Promise<void>;
  switchNetwork(chainId: number): Promise<void>;
  addNetwork(network: NetworkConfig): Promise<void>;
  getBalance(address: string): Promise<string>;
  isConnected(): boolean;
  getAddress(): string | null;
  getChainId(): number | null;
}

export type SupportedChains = {
  [key: string]: {
    id: number;
    name: string;
    config: NetworkConfig;
  };
};

export interface WalletEvents {
  connect: (address: string) => void;
  disconnect: () => void;
  chainChanged: (chainId: number) => void;
  accountsChanged: (accounts: string[]) => void;
}

export interface WalletReconnectionService {
  getWalletState: () => WalletState;
  attemptReconnection: () => Promise<boolean>;
  cleanup: () => void;
}
