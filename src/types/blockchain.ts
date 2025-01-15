export enum BlockchainNetwork {
  ETHEREUM = 'ethereum',
  BSC = 'bsc',
  POLYGON = 'polygon',
  AVALANCHE = 'avalanche'
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export interface NetworkStats {
  totalTokens: number;
  totalValue: string;
  transactionVolume: string;
  uniqueUsers: number;
}

export type NetworkConfigs = Record<BlockchainNetwork, NetworkConfig>;
