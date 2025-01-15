export const CONTRACT_ADDRESSES = {
  TOKEN_FACTORY: {
    sepolia: import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA,
    mainnet: import.meta.env.VITE_TOKEN_FACTORY_MAINNET,
    local: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  },
  TOKEN_FORGE_PLANS: {
    sepolia: import.meta.env.VITE_TOKEN_FORGE_PLANS_SEPOLIA,
    mainnet: import.meta.env.VITE_TOKEN_FORGE_PLANS_MAINNET,
    local: '0x...' // À remplir après le déploiement local
  },
  LIQUIDITY_LOCKER: {
    sepolia: import.meta.env.VITE_LIQUIDITY_LOCKER_SEPOLIA,
    mainnet: import.meta.env.VITE_LIQUIDITY_LOCKER_MAINNET,
    local: '0x...' // À remplir après le déploiement local
  },
  USDT: {
    sepolia: '0x...', // Ajouter l'adresse USDT sur Sepolia
    mainnet: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    local: '0x...' // Adresse locale
  }
} as const;

export const SUPPORTED_NETWORKS = {
  LOCAL: Number(import.meta.env.VITE_LOCAL_CHAIN_ID) || 31337,
  SEPOLIA: 11155111,
  MAINNET: 1
} as const;

export const getContractAddress = (contract: keyof typeof CONTRACT_ADDRESSES, chainId: number): string => {
  switch (chainId) {
    case SUPPORTED_NETWORKS.SEPOLIA:
      return CONTRACT_ADDRESSES[contract].sepolia;
    case SUPPORTED_NETWORKS.MAINNET:
      return CONTRACT_ADDRESSES[contract].mainnet;
    case SUPPORTED_NETWORKS.LOCAL:
      return CONTRACT_ADDRESSES[contract].local;
    default:
      throw new Error('Réseau non supporté');
  }
};