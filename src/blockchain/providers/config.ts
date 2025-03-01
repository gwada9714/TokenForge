import { mainnet, bsc, polygon, avalanche, arbitrum } from 'viem/chains';

/**
 * Configuration des chaînes blockchain supportées
 */
export const chainConfigs = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/${API_KEY}', 'https://mainnet.infura.io/v3/${API_KEY}'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://etherscan.io',
    chain: mainnet,
  },
  binance: {
    id: 56,
    name: 'Binance Smart Chain',
    rpcUrls: ['https://bsc-dataseed.binance.org/', 'https://bsc-dataseed1.defibit.io/'],
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorer: 'https://bscscan.com',
    chain: bsc,
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrls: ['https://polygon-rpc.com', 'https://rpc-mainnet.matic.network'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorer: 'https://polygonscan.com',
    chain: polygon,
  },
  avalanche: {
    id: 43114,
    name: 'Avalanche',
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    blockExplorer: 'https://snowtrace.io',
    chain: avalanche,
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://arbiscan.io',
    chain: arbitrum,
  },
  // Solana est traité différemment car non-EVM
  solana: {
    id: 101,
    name: 'Solana',
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
    blockExplorer: 'https://explorer.solana.com',
  },
};
