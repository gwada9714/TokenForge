import { Address } from 'viem';

interface ContractAddresses {
  [key: string]: {
    [chainId: number]: Address;
  };
}

const TOKEN_FACTORY_MAINNET = import.meta.env.VITE_TOKEN_FACTORY_MAINNET as string;
const TOKEN_FACTORY_SEPOLIA = import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA as string;

const contractAddresses: ContractAddresses = {
  TOKEN_FACTORY: {
    1: TOKEN_FACTORY_MAINNET as Address,
    11155111: '0xB0B6ED3e12f9Bb24b1bBC3413E3bb374A6e8B2E5' as Address, // Sepolia
  },
  TOKEN_FORGE_PLANS: {
    1: '0x0000000000000000000000000000000000000000' as Address, // Mainnet
    11155111: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as Address, // Sepolia
  },
  TKN_TOKEN: {
    1: '0x0000000000000000000000000000000000000000' as Address, // Mainnet
    11155111: '0x6829C3fAdcD7a68f613b9d68a1ed873d5C2E745d' as Address, // Sepolia
  },
  TAX_SYSTEM: {
    1: '0x0000000000000000000000000000000000000000' as Address, // Mainnet
    11155111: '0x37A15951Ac7d8b24A0bB9c3Eb5fB788866238EcA' as Address, // Sepolia
  },
};

export const getContractAddress = (contractName: string, chainId: number = 11155111): Address => {
  const address = contractAddresses[contractName]?.[chainId];
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    console.error('Configuration des contrats:', {
      contractName,
      chainId,
      address,
      allAddresses: contractAddresses
    });
    throw new Error(`Contract address not found or invalid for ${contractName} on chain ${chainId}`);
  }
  return address;
};