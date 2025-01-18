import { ethers, ContractTransaction } from 'ethers';
import { type Address } from 'viem';

export interface TokenContractMethods {
  transfer: (to: string, amount: bigint) => Promise<ContractTransaction>;
  mint: (to: string, amount: bigint) => Promise<ContractTransaction>;
  burn: (amount: bigint) => Promise<ContractTransaction>;
  name: () => Promise<string>;
  symbol: () => Promise<string>;
  decimals: () => Promise<number>;
  totalSupply: () => Promise<bigint>;
  balanceOf: (owner: string) => Promise<bigint>;
}

export interface FactoryContractMethods {
  createToken: (
    name: string,
    symbol: string,
    decimals: number,
    totalSupply: bigint,
    burnable: boolean,
    mintable: boolean,
    pausable: boolean
  ) => Promise<ContractTransaction>;
  getTokensByCreator: (creator: string) => Promise<string[]>;
}

export interface TaxConfig {
  enabled: boolean;
  taxPercentage: number;
  taxRecipient: string;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  owner: string;
  isBurnable: boolean;
  isMintable: boolean;
  isPausable: boolean;
  taxConfig: TaxConfig;
}

export interface TokenData extends TokenConfig {
  address: string;
  burned: boolean;
}

export type TokenForgeWriteFunction = 
  | 'renounceOwnership'
  | 'transferOwnership'
  | 'addAlertRule'
  | 'toggleAlertRule'
  | 'deleteAlertRule'
  | 'purgeAuditLogs';

export type TokenForgeReadFunction =
  | 'paused'
  | 'owner'
  | 'getAlertRules'
  | 'getAuditLogs';

export interface TokenForgeReadFunctionReturns {
  paused: boolean;
  owner: Address;
  getAlertRules: AlertRule[];
  getAuditLogs: AuditLog[];
}

export interface AlertRule {
  id: number;
  name: string;
  condition: string;
  enabled: boolean;
}

export interface AuditLog {
  id: number;
  timestamp: number;
  action: string;
  details: string;
  address: Address;
}

export interface TokenForgeAdminMethods {
  getAlertRules: () => Promise<AlertRule[]>;
  addAlertRule: (name: string, condition: string) => Promise<ContractTransaction>;
  toggleAlertRule: (id: number) => Promise<ContractTransaction>;
  deleteAlertRule: (id: number) => Promise<ContractTransaction>;
  getAuditLogs: () => Promise<AuditLog[]>;
  purgeAuditLogs: () => Promise<ContractTransaction>;
  owner: () => Promise<Address>;
  paused: () => Promise<boolean>;
  renounceOwnership: () => Promise<ContractTransaction>;
  transferOwnership: (newOwner: string) => Promise<ContractTransaction>;
}

// Types pour la configuration des contrats
export interface ChainContract {
  address: Address;
  blockCreated?: number;
}

export interface NetworkContract {
  tokenFactory: ChainContract;
  platformToken: ChainContract;
  plans: ChainContract;
  liquidityLocker: ChainContract;
  staking: ChainContract;
  launchpad: ChainContract;
}

export interface ContractAddresses {
  mainnet: NetworkContract;
  sepolia: NetworkContract;
}

// Type pour la configuration des chaînes
export interface ExtendedChain {
  id: number;
  name: string;
  network: string;
  contracts?: NetworkContract;
}

export type TokenContract = ethers.Contract & TokenContractMethods;
export type FactoryContract = ethers.Contract & FactoryContractMethods;
export type TokenForgeContract = ethers.Contract & TokenForgeAdminMethods;