import { mainnet, sepolia } from "viem/chains";
import { type Chain } from "viem";

// Export des chaînes individuelles pour une utilisation directe
export { mainnet, sepolia };

// Type pour notre configuration de chaîne étendue
type ChainConfig = {
  chain: Chain;
  contractAddress: `0x${string}` | null;
  name: string;
};

// Validation des adresses des contrats
const validateContractAddress = (
  address: string | undefined,
  chainName: string
): `0x${string}` | null => {
  if (!address) {
    console.warn(
      `Adresse TokenFactory manquante pour ${chainName} - cette chaîne sera désactivée`
    );
    return null;
  }
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.warn(
      `Format d'adresse TokenFactory invalide pour ${chainName} - cette chaîne sera désactivée`
    );
    return null;
  }
  return address as `0x${string}`;
};

// Récupération des adresses des contrats depuis les variables d'environnement
const contractAddresses = {
  mainnet: validateContractAddress(
    import.meta.env.VITE_TOKEN_FACTORY_MAINNET,
    "Ethereum Mainnet"
  ),
  sepolia: validateContractAddress(
    import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA,
    "Sepolia"
  ),
};

// Configuration des chaînes supportées
const chainConfigs: ChainConfig[] = [
  {
    chain: mainnet,
    contractAddress: contractAddresses.mainnet,
    name: "Ethereum Mainnet",
  },
  {
    chain: sepolia,
    contractAddress: contractAddresses.sepolia,
    name: "Sepolia Testnet",
  },
];

// Filtrer les chaînes qui ont des adresses de contrat valides
export const supportedChains = chainConfigs
  .filter((config) => config.contractAddress !== null)
  .map((config) => config.chain);

// Définir la chaîne par défaut (Sepolia si disponible, sinon la première chaîne supportée)
export const defaultChain =
  supportedChains.find((chain) => chain.id === sepolia.id) ||
  supportedChains[0];

if (!defaultChain) {
  throw new Error(
    "No valid chains configured. Please check your contract addresses and RPC URLs."
  );
}

// Export the chain IDs
export const supportedChainIds = supportedChains.map((chain) => chain.id);

// Configuration RPC par chaîne
export const getRpcUrl = (chainId: number): string => {
  const chain = supportedChains.find((chain) => chain.id === chainId);
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
