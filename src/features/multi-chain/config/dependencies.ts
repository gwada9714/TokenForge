// Providers et configurations pour chaque blockchain
export const PROVIDERS = {
  // Clés d'API pour les fournisseurs de services blockchain
  ALCHEMY_KEY: process.env.REACT_APP_ALCHEMY_KEY || '',
  INFURA_KEY: process.env.REACT_APP_INFURA_KEY || '',
  BSC_NODE_KEY: process.env.REACT_APP_BSC_NODE_KEY || '',
  POLYGON_NODE_KEY: process.env.REACT_APP_POLYGON_NODE_KEY || '',
  SOLANA_NODE_KEY: process.env.REACT_APP_SOLANA_NODE_KEY || '',
  COINGECKO_KEY: process.env.REACT_APP_COINGECKO_KEY || '',
} as const;

// Configuration des timeouts et retries
export const NETWORK_CONFIG = {
  REQUEST_TIMEOUT: 30000, // 30 secondes
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 seconde
  BATCH_SIZE: 100, // Pour les requêtes en lot
} as const;

// Configuration des gas limits par défaut pour les chaînes EVM
export const DEFAULT_GAS_CONFIG = {
  ETH: {
    LIMIT: '300000',
    PRICE_MULTIPLIER: 1.1, // +10% du prix du gas suggéré
  },
  BSC: {
    LIMIT: '300000',
    PRICE_MULTIPLIER: 1.05, // +5% du prix du gas suggéré
  },
  POLYGON: {
    LIMIT: '300000',
    PRICE_MULTIPLIER: 1.2, // +20% du prix du gas suggéré
  },
} as const;
