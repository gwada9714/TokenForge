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
    tokenForge: '0xE2b29a1D3021027aF7AC8dAe5e230922F3247a0A' as Address, // TokenForgeFactory vérifié sur Etherscan
    staking: '0xF8ee9A71f42a35A6d18677629Ef6B4A7dE9d4Cb7' as Address,
    treasury: '0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A' as Address,
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

// ID du réseau Sepolia
export const REQUIRED_NETWORK_ID = 11155111;
