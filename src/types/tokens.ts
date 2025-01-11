import { Address } from 'viem';

export interface TokenBaseConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
}

export interface TokenAdvancedConfig {
  burnable: boolean;
  mintable: boolean;
  pausable: boolean;
  upgradeable: boolean;
  transparent: boolean;
  uups: boolean;
  permit: boolean;
  votes: boolean;
  accessControl: 'none' | 'ownable' | 'roles';
  baseURI?: string;
  asset?: string;
  maxSupply?: string;
  depositLimit?: string;
}

export type DeploymentStatusType = 'pending' | 'success' | 'failed';

export interface DeploymentStatus {
  status: DeploymentStatusType;
  confirmations: number;
  error?: string;
  txHash?: Address;
  tokenAddress?: Address;
  proxyAddress?: Address;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  maxSupply: bigint | null;
  burnable: boolean;
  mintable: boolean;
  owner?: string;
  totalSupply?: bigint;
}
