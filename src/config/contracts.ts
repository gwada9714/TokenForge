// Type helper pour les adresses Ethereum
type Address = `0x${string}`;

// Helper function to ensure address format
const formatAddress = (address: string | undefined): Address => {
  if (!address) return '0x0000000000000000000000000000000000000000' as Address;
  if (!address.startsWith('0x')) {
    return `0x${address}` as Address;
  }
  return address as Address;
};

export const CONTRACT_ADDRESSES = {
  TOKEN_FACTORY: {
    sepolia: formatAddress(import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_TOKEN_FACTORY_MAINNET),
    local: formatAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3')
  },
  TOKEN_FORGE_PLANS: {
    sepolia: formatAddress(import.meta.env.VITE_TOKEN_FORGE_PLANS_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_TOKEN_FORGE_PLANS_MAINNET),
    local: formatAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3')
  },
  PLATFORM_TOKEN: {
    sepolia: formatAddress(import.meta.env.VITE_PLATFORM_TOKEN_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_PLATFORM_TOKEN_MAINNET),
    local: formatAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3')
  },
  LIQUIDITY_LOCKER: {
    sepolia: formatAddress(import.meta.env.VITE_LIQUIDITY_LOCKER_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_LIQUIDITY_LOCKER_MAINNET),
    local: formatAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3')
  },
  USDT: {
    sepolia: formatAddress('0x...'), // Ajouter l'adresse USDT sur Sepolia
    mainnet: formatAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
    local: formatAddress('0x...') // Adresse locale
  }
} as const;

// DeFi contracts
export const STAKING_CONTRACT_ADDRESS = {
  sepolia: formatAddress(import.meta.env.VITE_STAKING_CONTRACT_SEPOLIA),
  mainnet: formatAddress(import.meta.env.VITE_STAKING_CONTRACT_MAINNET),
  local: formatAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3') // Replace with your local deployment address
};

export const LAUNCHPAD_CONTRACT_ADDRESS = {
  sepolia: formatAddress(import.meta.env.VITE_LAUNCHPAD_CONTRACT_SEPOLIA),
  mainnet: formatAddress(import.meta.env.VITE_LAUNCHPAD_CONTRACT_MAINNET),
  local: formatAddress('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') // Replace with your local deployment address
};

export const SUPPORTED_NETWORKS = {
  LOCAL: Number(import.meta.env.VITE_LOCAL_CHAIN_ID) || 31337,
  SEPOLIA: 11155111,
  MAINNET: 1
} as const;

export type ContractType = keyof typeof CONTRACT_ADDRESSES | 'STAKING_CONTRACT' | 'LAUNCHPAD';

export const getContractAddress = (contract: ContractType, chainId: number): Address => {
  switch (chainId) {
    case SUPPORTED_NETWORKS.SEPOLIA:
      if (contract === 'STAKING_CONTRACT') return STAKING_CONTRACT_ADDRESS.sepolia;
      if (contract === 'LAUNCHPAD') return LAUNCHPAD_CONTRACT_ADDRESS.sepolia;
      return CONTRACT_ADDRESSES[contract as keyof typeof CONTRACT_ADDRESSES].sepolia;
    
    case SUPPORTED_NETWORKS.MAINNET:
      if (contract === 'STAKING_CONTRACT') return STAKING_CONTRACT_ADDRESS.mainnet;
      if (contract === 'LAUNCHPAD') return LAUNCHPAD_CONTRACT_ADDRESS.mainnet;
      return CONTRACT_ADDRESSES[contract as keyof typeof CONTRACT_ADDRESSES].mainnet;

    default:
      if (contract === 'STAKING_CONTRACT') return STAKING_CONTRACT_ADDRESS.local;
      if (contract === 'LAUNCHPAD') return LAUNCHPAD_CONTRACT_ADDRESS.local;
      return CONTRACT_ADDRESSES[contract as keyof typeof CONTRACT_ADDRESSES].local;
  }
};