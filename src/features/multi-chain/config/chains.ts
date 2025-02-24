import { ChainId, EVMChainConfig, SolanaChainConfig } from '../types/Chain';
import { PaymentNetwork } from '../types/PaymentNetwork';

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

interface ChainConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    payment: string;
    treasury: string;
  };
}

export const CHAIN_CONFIG: Record<PaymentNetwork, ChainConfig> = {
  [PaymentNetwork.ETHEREUM]: {
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.VITE_ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    chainId: 1,
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      payment: process.env.VITE_ETH_PAYMENT_CONTRACT || '0x...',
      treasury: process.env.VITE_ETH_TREASURY_ADDRESS || '0x...'
    }
  },
  [PaymentNetwork.POLYGON]: {
    name: 'Polygon Mainnet',
    rpcUrl: process.env.VITE_POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
    chainId: 137,
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    contracts: {
      payment: process.env.VITE_POLYGON_PAYMENT_CONTRACT || '0x...',
      treasury: process.env.VITE_POLYGON_TREASURY_ADDRESS || '0x...'
    }
  },
  [PaymentNetwork.BSC]: {
    name: 'BNB Smart Chain',
    rpcUrl: process.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    chainId: 56,
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    contracts: {
      payment: process.env.VITE_BSC_PAYMENT_CONTRACT || '0x...',
      treasury: process.env.VITE_BSC_TREASURY_ADDRESS || '0x...'
    }
  },
  [PaymentNetwork.SOLANA]: {
    name: 'Solana Mainnet',
    rpcUrl: process.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    chainId: 101,
    blockExplorer: 'https://explorer.solana.com',
    nativeCurrency: {
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9
    },
    contracts: {
      payment: process.env.VITE_SOLANA_PAYMENT_PROGRAM || 'PayXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      treasury: process.env.VITE_SOLANA_TREASURY_ADDRESS || '0x...'
    }
  }
};

export const getChainConfig = (network: PaymentNetwork): ChainConfig => {
  const config = CHAIN_CONFIG[network];
  if (!config) {
    throw new Error(`Configuration non trouvée pour le réseau ${network}`);
  }
  return config;
};

export const validateChainConfig = (network: PaymentNetwork): boolean => {
  const config = CHAIN_CONFIG[network];
  if (!config) return false;

  // Vérifier que les valeurs requises sont définies
  const requiredValues = [
    config.rpcUrl,
    config.contracts.payment,
    config.contracts.treasury
  ];

  return requiredValues.every(value => 
    value && 
    value !== '0x...' && 
    !value.includes('your-api-key')
  );
};
