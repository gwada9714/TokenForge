import { type Address } from 'viem';

export const CONTRACT_ADDRESS = (process.env.REACT_APP_CONTRACT_ADDRESS || '0x0') as Address;

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ type: 'address', name: 'newOwner' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, type: 'address', name: 'account' }],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, type: 'address', name: 'account' }],
    name: 'Unpaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, type: 'address', name: 'previousOwner' },
      { indexed: true, type: 'address', name: 'newOwner' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
] as const;
