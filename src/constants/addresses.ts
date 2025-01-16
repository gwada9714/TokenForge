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
    // Mainnet
    tokenForge: '0x1234567890123456789012345678901234567890' as Address, // À remplacer par l'adresse réelle
    staking: '0x0987654321098765432109876543210987654321' as Address, // À remplacer par l'adresse réelle
    treasury: '0x5432109876543210987654321098765432109876' as Address, // À remplacer par l'adresse réelle
  },
  5: {
    // Goerli testnet
    tokenForge: '0x9876543210987654321098765432109876543210' as Address, // À remplacer par l'adresse réelle
    staking: '0x8765432109876543210987654321098765432109' as Address, // À remplacer par l'adresse réelle
    treasury: '0x7654321098765432109876543210987654321098' as Address, // À remplacer par l'adresse réelle
  }
};

// Export des adresses individuelles
export const STAKING_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[1].staking; // Utiliser l'adresse mainnet par défaut
export const TOKEN_FORGE_ADDRESS = CONTRACT_ADDRESSES[1].tokenForge;
export const TREASURY_ADDRESS = CONTRACT_ADDRESSES[1].treasury;
