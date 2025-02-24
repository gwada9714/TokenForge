// src/services/tokenService.ts
import { validateAddress } from '../utils/address';
import { UserToken } from '../store/slices/userTokensSlice';

export const getUserTokens = async (address: string): Promise<UserToken[]> => {
  if (!validateAddress(address)) {
    throw new Error("Format d'adresse invalide");
  }
  
  try {
    // Mock data pour le développement
    return [
      {
        address: "0x1234567890123456789012345678901234567890",
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
        totalSupply: "1000000000000000000000000",
        chainId: 1,
        balance: "100000000000000000000" // 100 tokens
      },
      {
        address: "0x0987654321098765432109876543210987654321",
        name: "Demo Token",
        symbol: "DEMO",
        decimals: 18,
        totalSupply: "500000000000000000000000",
        chainId: 1,
        balance: "50000000000000000000" // 50 tokens
      }
    ];
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    throw error;
  }
};

export const getTokenDetails = async (address: string): Promise<UserToken> => {
  if (!validateAddress(address)) {
    throw new Error("Format d'adresse invalide");
  }

  try {
    // Mock data pour le développement
    return {
      address: address,
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      totalSupply: "1000000000000000000000000",
      chainId: 1,
      balance: "100000000000000000000" // 100 tokens
    };
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw error;
  }
};