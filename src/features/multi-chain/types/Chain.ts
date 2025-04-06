export enum ChainId {
  ETH = 1,
  BSC = 56,
  POLYGON = 137,
  SOLANA = "solana", // Solana n'utilise pas le même système d'ID
}

export interface ChainConfig {
  id: ChainId;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  testnet?: boolean;
}

export interface EVMChainConfig extends ChainConfig {
  chainId: number; // Pour la compatibilité avec les wallets EVM
  networkId: number;
}

export interface SolanaChainConfig extends ChainConfig {
  cluster: "mainnet-beta" | "testnet" | "devnet";
  wsEndpoint: string;
}
