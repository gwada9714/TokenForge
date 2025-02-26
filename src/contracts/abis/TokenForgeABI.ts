export const TokenForgeABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ type: 'address', name: 'account' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'mintable',
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'burnable',
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pausable',
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTaxConfig',
    outputs: [
      {
        components: [
          { type: 'uint256', name: 'buyTax' },
          { type: 'uint256', name: 'sellTax' },
          { type: 'uint256', name: 'transferTax' }
        ],
        type: 'tuple',
        name: ''
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount' }
    ],
    name: 'transfer',
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ type: 'uint256', name: 'amount' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { type: 'string', name: 'name' },
      { type: 'string', name: 'symbol' },
      { type: 'uint8', name: 'decimals' },
      { type: 'uint256', name: 'initialSupply' },
      { type: 'uint256', name: 'maxSupply' },
      { type: 'bool', name: 'mintable' },
      { type: 'bool', name: 'burnable' },
      { type: 'bool', name: 'pausable' },
      {
        components: [
          { type: 'bool', name: 'enabled' },
          { type: 'uint256', name: 'buyTax' },
          { type: 'uint256', name: 'sellTax' },
          { type: 'uint256', name: 'transferTax' }
        ],
        type: 'tuple',
        name: 'taxConfig'
      }
    ],
    name: 'createToken',
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const; 