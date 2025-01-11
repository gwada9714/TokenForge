// src/services/tokenService.ts
import { validateAddress, checksumAddress } from '../utils/address';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  totalSupply: string;
  maxSupply: string;
  mintable: boolean;
  burnable: boolean;
  owner: string;
}

export const fetchTokens = async (address: string): Promise<TokenInfo[]> => {
  if (!validateAddress(address)) {
    throw new Error("Format d'adresse invalide");
  }

  const checkedAddress = checksumAddress(address);
  
  try {
    // Mock data avec toutes les propriétés requises
    return [{
      address: checkedAddress,
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      balance: "0",
      totalSupply: "1000000000000000000000000",
      maxSupply: "2000000000000000000000000",
      mintable: true,
      burnable: true,
      owner: checkedAddress
    }];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw error;
  }
};