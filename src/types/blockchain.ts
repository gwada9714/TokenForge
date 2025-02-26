export type BlockchainNetwork = 'ethereum' | 'bsc' | 'polygon' | 'avalanche' | 'solana' | 'arbitrum';

export interface NetworkConfig {
  chainId: number;
  name: BlockchainNetwork;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface NetworkFees {
  launchpad: number;
  staking: number;
  marketing?: number;
  kyc?: number;
}

export interface NetworkStats {
  totalTokens: number;
  totalValue: string;
  transactionVolume: string;
  uniqueUsers: number;
}

export type NetworkConfigs = Record<BlockchainNetwork, NetworkConfig>;
