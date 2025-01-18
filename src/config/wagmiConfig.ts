import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { configureChains, createConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { type Chain } from 'wagmi';

// Récupération des variables d'environnement avec valeurs par défaut pour le développement
const getEnvVariable = (key: string, required: boolean = true): string => {
  const value = import.meta.env[key];
  if (!value && required) {
    throw new Error(`Error: ${key} is required but not defined in environment variables`);
  }
  return value || '';
};

// Validation des adresses des contrats
const validateContractAddress = (address: string | undefined, chainName: string): `0x${string}` | null => {
  if (!address) {
    console.warn(`Adresse TokenFactory manquante pour ${chainName} - cette chaîne sera désactivée`);
    return null;
  }
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.warn(`Format d'adresse TokenFactory invalide pour ${chainName} - cette chaîne sera désactivée`);
    return null;
  }
  return address as `0x${string}`;
};

// Récupération des variables d'environnement requises
const projectId = getEnvVariable('VITE_WALLET_CONNECT_PROJECT_ID', true);
const alchemyId = getEnvVariable('VITE_ALCHEMY_API_KEY', true);

// Récupération des adresses des contrats
const contractAddresses = {
  mainnet: validateContractAddress(
    import.meta.env.VITE_TOKEN_FACTORY_MAINNET,
    'Ethereum Mainnet'
  ),
  sepolia: validateContractAddress(
    import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA,
    'Sepolia'
  )
};

// Log des variables d'environnement chargées (sans les valeurs sensibles)
console.log('Environment variables loaded:', {
  VITE_WALLET_CONNECT_PROJECT_ID: !!projectId,
  VITE_ALCHEMY_API_KEY: !!alchemyId,
  VITE_TOKEN_FACTORY_MAINNET: !!contractAddresses.mainnet,
  VITE_TOKEN_FACTORY_SEPOLIA: !!contractAddresses.sepolia
});

// Configuration des chaînes avec leurs contrats
interface ExtendedChain extends Chain {
  contracts?: {
    tokenFactory: {
      address: `0x${string}`;
      blockCreated: number;
    };
  };
}

const createChainConfig = (
  baseChain: Chain,
  contractAddress: `0x${string}` | null,
  blockCreated: number
): ExtendedChain | null => {
  if (!contractAddress) return null;
  
  return {
    ...baseChain,
    contracts: {
      tokenFactory: {
        address: contractAddress,
        blockCreated
      }
    }
  };
};

const mainnetChain = createChainConfig(
  mainnet,
  contractAddresses.mainnet,
  Number(import.meta.env.VITE_TOKEN_FACTORY_MAINNET_BLOCK || '0')
);

const sepoliaChain = createChainConfig(
  sepolia,
  contractAddresses.sepolia,
  Number(import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA_BLOCK || '0')
);

// Filtrer les chaînes non configurées
const availableChains: ExtendedChain[] = [
  mainnetChain,
  sepoliaChain
].filter((chain): chain is ExtendedChain => chain !== null);

if (availableChains.length === 0) {
  throw new Error('No valid chains configured. Please check your contract addresses in environment variables.');
}

// Configuration des chaînes avec providers
const { chains: configuredChainsList, publicClient } = configureChains(
  availableChains,
  [
    alchemyProvider({ apiKey: alchemyId }),
    publicProvider(),
  ]
);

// Configuration des wallets
const { connectors } = getDefaultWallets({
  appName: 'TokenForge',
  projectId: projectId,
  chains: configuredChainsList,
});

// Configuration wagmi
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// Configuration de l'application
export const appConfig = {
  appName: 'TokenForge',
  description: "Create and manage your own tokens",
  url: "https://tokenforge.app",
  icons: ["https://tokenforge.app/logo.png"],
};

// Export des configurations
export { configuredChainsList as chains };
export { wagmiConfig };
export default wagmiConfig;