/**
 * Constantes pour les chaînes blockchain supportées
 */

export enum ChainId {
  ETHEREUM = 1,
  BINANCE = 56,
  POLYGON = 137,
  AVALANCHE = 43114,
  ARBITRUM = 42161,
  SOLANA = 'solana',
}

export const CHAIN_NAMES = {
  [ChainId.ETHEREUM]: 'Ethereum',
  [ChainId.BINANCE]: 'Binance Smart Chain',
  [ChainId.POLYGON]: 'Polygon',
  [ChainId.AVALANCHE]: 'Avalanche',
  [ChainId.ARBITRUM]: 'Arbitrum',
  [ChainId.SOLANA]: 'Solana',
};

export const CHAIN_NATIVE_CURRENCIES = {
  [ChainId.ETHEREUM]: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  [ChainId.BINANCE]: {
    name: 'Binance Coin',
    symbol: 'BNB',
    decimals: 18,
  },
  [ChainId.POLYGON]: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  [ChainId.AVALANCHE]: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  [ChainId.ARBITRUM]: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  [ChainId.SOLANA]: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
};

export const SUPPORTED_CHAINS = [
  ChainId.ETHEREUM,
  ChainId.BINANCE,
  ChainId.POLYGON,
  ChainId.AVALANCHE,
  ChainId.ARBITRUM,
  ChainId.SOLANA,
];
