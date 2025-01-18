import { type Address } from 'viem';

// Adresses des contrats par réseau
interface NetworkAddresses {
  [chainId: number]: {
    tokenForge: Address;
    staking: Address;
    treasury: Address;
  };
}

export const CONTRACT_ADDRESSES: NetworkAddresses = {
  1: {
    // Mainnet - À ne pas utiliser en production sans audit
    tokenForge: '0x0000000000000000000000000000000000000000' as Address, // Non déployé
    staking: '0x0000000000000000000000000000000000000000' as Address, // Non déployé
    treasury: '0x0000000000000000000000000000000000000000' as Address, // Non déployé
  },
  5: {
    // Goerli testnet (déprécié)
    tokenForge: '0x0000000000000000000000000000000000000000' as Address,
    staking: '0x0000000000000000000000000000000000000000' as Address,
    treasury: '0x0000000000000000000000000000000000000000' as Address,
  },
  11155111: {
    // Sepolia testnet (réseau de test actif)
    tokenForge: '0x4007d5731b8C4659404dEAa0e1cEE6e7481a6Edf' as Address, // TokenForgeFactory vérifié sur Etherscan
    staking: '0x0000000000000000000000000000000000000000' as Address, // À déployer plus tard
    treasury: '0x0000000000000000000000000000000000000000' as Address, // À déployer plus tard
  }
};

// Export des adresses par défaut (utilise Sepolia)
export const TOKEN_FORGE_ADDRESS = CONTRACT_ADDRESSES[11155111].tokenForge;
export const STAKING_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[11155111].staking;
export const TREASURY_ADDRESS = CONTRACT_ADDRESSES[11155111].treasury;

// Alias pour clarté
export const SEPOLIA_TOKEN_FORGE_ADDRESS = TOKEN_FORGE_ADDRESS;
export const SEPOLIA_STAKING_CONTRACT_ADDRESS = STAKING_CONTRACT_ADDRESS;
export const SEPOLIA_TREASURY_ADDRESS = TREASURY_ADDRESS;
