import { Address } from 'viem';

export const CONTRACT_ADDRESS = (process.env.REACT_APP_CONTRACT_ADDRESS || '0x0') as Address;

export const CONTRACT_ABI = [
  {
    name: 'pause',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'unpause',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'transferOwnership',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newOwner', type: 'address' }],
    outputs: [],
  },
  {
    name: 'Paused',
    type: 'event',
    inputs: [{ indexed: false, name: 'account', type: 'address' }],
  },
  {
    name: 'Unpaused',
    type: 'event',
    inputs: [{ indexed: false, name: 'account', type: 'address' }],
  },
  {
    name: 'OwnershipTransferred',
    type: 'event',
    inputs: [
      { indexed: true, name: 'previousOwner', type: 'address' },
      { indexed: true, name: 'newOwner', type: 'address' },
    ],
  },
] as const;
