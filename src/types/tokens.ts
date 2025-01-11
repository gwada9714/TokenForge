import { Address, Hash } from 'viem';

export interface TokenBaseConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
}

export interface TokenAdvancedConfig {
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  permit: boolean;
  votes: boolean;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  mintable: boolean;
  burnable: boolean;
}

export interface TokenOperation {
  type: 'mint' | 'burn' | 'transfer' | 'approve';
  amount: string;
  from: Address;
  to?: Address;
  timestamp: number;
  transactionHash: Address;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
}

export interface TokenStatistics {
  totalTransfers: number;
  totalMinted: string;
  totalBurned: string;
  uniqueHolders: number;
  largestHolder: {
    address: Address;
    balance: string;
    percentage: number;
  };
  marketData?: {
    price?: number;
    marketCap?: number;
    volume24h?: number;
  };
}

export interface TokenAllowance {
  owner: Address;
  spender: Address;
  amount: string;
  lastUpdated: number;
}

export interface TokenHistory {
  operations: TokenOperation[];
  statistics: TokenStatistics;
  allowances: TokenAllowance[];
}

export interface TokenRole {
  role: 'owner' | 'minter' | 'pauser';
  address: Address;
  grantedAt: number;
  grantedBy: Address;
}

export interface TokenMetadata {
  logo?: string;
  website?: string;
  description?: string;
  social?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string;
  };
}

export interface TokenDeploymentStatus {
  status: 'success' | 'error';
  contractAddress?: Address;
  transactionHash?: Hash;
  blockNumber?: bigint;
  error?: string;
}
