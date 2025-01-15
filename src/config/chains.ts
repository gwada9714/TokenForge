import { mainnet, sepolia } from 'viem/chains';
import { type Chain } from 'viem';

// Type pour notre configuration de chaîne étendue
type ChainConfig = {
  chain: Chain;
  contractAddress: `0x${string}` | null;
  name: string;
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

// Récupération des adresses des contrats depuis les variables d'environnement
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

// Configuration des chaînes avec leurs contrats respectifs
const chainsConfig: ChainConfig[] = [
  {
    chain: {
      ...sepolia,
      rpcUrls: {
        ...sepolia.rpcUrls,
        default: {
          http: [import.meta.env.VITE_SEPOLIA_RPC_URL],
        },
      },
    },
    contractAddress: contractAddresses.sepolia,
    name: 'Sepolia Testnet'
  },
  {
    chain: {
      ...mainnet,
      rpcUrls: {
        ...mainnet.rpcUrls,
        default: {
          http: [import.meta.env.VITE_MAINNET_RPC_URL],
        },
      },
    },
    contractAddress: contractAddresses.mainnet,
    name: 'Ethereum Mainnet'
  }
];

// Filtrer les chaînes qui ont des adresses de contrat valides
export const supportedChains = chainsConfig
  .filter(({ contractAddress }) => contractAddress !== null)
  .map(({ chain }) => chain);

// Export the chain IDs
export const supportedChainIds = supportedChains.map(chain => chain.id);

// Get the default chain (Sepolia for development)
export const defaultChain = supportedChains.find(chain => chain.id === sepolia.id) || supportedChains[0];

if (supportedChains.length === 0) {
  console.warn('Aucune chaîne n\'est configurée avec des adresses TokenFactory valides');
}

// Configuration RPC par chaîne
export const getRpcUrl = (chainId: number): string => {
  const chain = supportedChains.find(chain => chain.id === chainId);
  if (!chain) {
    throw new Error(`Chaîne ID ${chainId} non supportée`);
  }
  return chain.rpcUrls.default.http[0];
};

// Types pour les contrats
export type TokenForgeContracts = {
  tokenFactory: {
    address: `0x${string}`;
    blockCreated: number;
  };
};

// Type pour les chaînes supportées
export type SupportedChain = (typeof supportedChains)[number];
