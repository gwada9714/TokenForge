// Type helper pour les adresses Ethereum
type Address = `0x${string}`;

// Helper function to ensure address format
const formatAddress = (address: string | undefined): Address | null => {
  if (!address) {
    return null;
  }

  // Nettoyer l'adresse
  const cleanAddress = address.toLowerCase().trim();
  
  // Vérifier si c'est une adresse nulle
  if (cleanAddress === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  // Vérifier le format de l'adresse
  const addressRegex = /^(0x)?[0-9a-f]{40}$/i;
  if (!addressRegex.test(cleanAddress)) {
    console.warn(`Invalid address format: ${address}`);
    return null;
  }

  // Ajouter le préfixe 0x si nécessaire
  const formattedAddress = cleanAddress.startsWith('0x') ? cleanAddress : `0x${cleanAddress}`;
  return formattedAddress as Address;
};

// Contract addresses configuration
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
    local: formatAddress('0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0')
  },
  STAKING_CONTRACT: {
    sepolia: formatAddress(import.meta.env.VITE_STAKING_CONTRACT_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_STAKING_CONTRACT_MAINNET),
    local: formatAddress('0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82')
  },
  LIQUIDITY_LOCKER: {
    sepolia: formatAddress(import.meta.env.VITE_LIQUIDITY_LOCKER_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_LIQUIDITY_LOCKER_MAINNET),
    local: formatAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3')
  },
  LAUNCHPAD: {
    sepolia: formatAddress(import.meta.env.VITE_LAUNCHPAD_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_LAUNCHPAD_MAINNET),
    local: formatAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3')
  },
  USDT: {
    sepolia: null, // Adresse USDT sur Sepolia à définir
    mainnet: formatAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
    local: null // Adresse locale à définir
  },
  PREMIUM_SERVICES: {
    sepolia: formatAddress(import.meta.env.VITE_PREMIUM_SERVICES_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_PREMIUM_SERVICES_MAINNET),
    local: formatAddress('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9')
  },
  TAX_MANAGER: {
    sepolia: formatAddress(import.meta.env.VITE_TAX_MANAGER_SEPOLIA),
    mainnet: formatAddress(import.meta.env.VITE_TAX_MANAGER_MAINNET),
    local: formatAddress('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9')
  }
} as const;

export type ContractType = keyof typeof CONTRACT_ADDRESSES;

// Helper function to get contract address
export const getContractAddress = (contract: ContractType, chainId: number): Address | null => {
  try {
    let networkKey: keyof typeof CONTRACT_ADDRESSES[typeof contract];

    switch (chainId) {
      case SUPPORTED_NETWORKS.SEPOLIA:
        networkKey = 'sepolia';
        break;
      case SUPPORTED_NETWORKS.MAINNET:
        networkKey = 'mainnet';
        break;
      case SUPPORTED_NETWORKS.LOCAL:
        networkKey = 'local';
        break;
      default:
        console.warn(`Unsupported chain ID: ${chainId}`);
        return null;
    }

    const address = CONTRACT_ADDRESSES[contract][networkKey];
    if (!address) {
      console.warn(`No address configured for contract ${contract} on network ${networkKey}`);
      return null;
    }

    return address;
  } catch (error) {
    console.error(`Error getting contract address for ${contract} on chain ${chainId}:`, error);
    return null;
  }
};

export const SUPPORTED_NETWORKS = {
  LOCAL: Number(import.meta.env.VITE_LOCAL_CHAIN_ID) || 31337,
  SEPOLIA: 11155111,
  MAINNET: 1
} as const;