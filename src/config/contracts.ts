import { Address } from 'viem';

interface ContractAddresses {
  [key: string]: {
    [chainId: number]: Address;
  };
}

const contractAddresses: ContractAddresses = {
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
  if (!address) {
    throw new Error(`Contract address not found for ${contractName} on chain ${chainId}`);
  }
  return address;
};