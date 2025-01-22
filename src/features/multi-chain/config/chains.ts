import { ChainId, EVMChainConfig, SolanaChainConfig } from '../types/Chain';

export const ethereumConfig: EVMChainConfig = {
  id: ChainId.ETH,
  chainId: 1,
  networkId: 1,
  name: 'Ethereum',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}',
    'https://mainnet.infura.io/v3/${INFURA_KEY}',
  ],
  blockExplorerUrls: ['https://etherscan.io'],
};

export const bscConfig: EVMChainConfig = {
  id: ChainId.BSC,
  chainId: 56,
  networkId: 56,
  name: 'Binance Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io',
  ],
  blockExplorerUrls: ['https://bscscan.com'],
};

export const polygonConfig: EVMChainConfig = {
  id: ChainId.POLYGON,
  chainId: 137,
  networkId: 137,
  name: 'Polygon',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: [
    'https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}',
    'https://polygon-rpc.com',
  ],
  blockExplorerUrls: ['https://polygonscan.com'],
};

export const solanaConfig: SolanaChainConfig = {
  id: ChainId.SOLANA,
  name: 'Solana',
  cluster: 'mainnet-beta',
  nativeCurrency: {
    name: 'SOL',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: ['https://api.mainnet-beta.solana.com'],
  wsEndpoint: 'wss://api.mainnet-beta.solana.com',
  blockExplorerUrls: ['https://explorer.solana.com'],
};

export const supportedChains = {
  [ChainId.ETH]: ethereumConfig,
  [ChainId.BSC]: bscConfig,
  [ChainId.POLYGON]: polygonConfig,
  [ChainId.SOLANA]: solanaConfig,
} as const;

export const getChainConfig = (chainId: ChainId) => {
  return supportedChains[chainId];
};
