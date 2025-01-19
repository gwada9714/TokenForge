import { Address } from 'viem';

interface ContractAddresses {
  [key: string]: {
    [chainId: number]: Address;
  };
}

const contractAddresses: ContractAddresses = {
  TOKEN_FACTORY: {
    1: '0x0000000000000000000000000000000000000000' as Address, // Mainnet - pas encore déployé
    11155111: '0xE2b29a1D3021027aF7AC8dAe5e230922F3247a0A' as Address, // Sepolia
  },
  LAUNCHPAD: {
    1: '0x0000000000000000000000000000000000000000' as Address, // Mainnet
    11155111: '0x1234567890123456789012345678901234567890' as Address, // Sepolia - À remplacer par la vraie adresse
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

export const LAUNCHPAD_ADDRESS = getContractAddress('LAUNCHPAD');

export const LAUNCHPAD_ABI = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'tokenPrice', type: 'uint256' },
      { name: 'hardCap', type: 'uint256' },
      { name: 'softCap', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' }
    ],
    name: 'createPool',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'contribute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'claimTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'getPoolInfo',
    outputs: [
      {
        components: [
          { name: 'token', type: 'address' },
          { name: 'tokenPrice', type: 'uint256' },
          { name: 'hardCap', type: 'uint256' },
          { name: 'softCap', type: 'uint256' },
          { name: 'totalRaised', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'endTime', type: 'uint256' },
          { name: 'finalized', type: 'bool' },
          { name: 'cancelled', type: 'bool' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    name: 'getUserContribution',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;