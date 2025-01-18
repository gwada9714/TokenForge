import { ethers, ContractTransaction } from 'ethers';

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

export interface AlertRule {
  id: bigint;
  name: string;
  condition: string;
  enabled: boolean;
}

export interface AuditLog {
  id: bigint;
  timestamp: bigint;
  action: string;
  details: string;
  address: string;
}

export interface TokenForgeAdminMethods {
  getAlertRules: () => Promise<AlertRule[]>;
  addAlertRule: (name: string, condition: string) => Promise<ContractTransaction>;
  toggleAlertRule: (id: bigint) => Promise<ContractTransaction>;
  deleteAlertRule: (id: bigint) => Promise<ContractTransaction>;
  getAuditLogs: () => Promise<AuditLog[]>;
  purgeAuditLogs: () => Promise<ContractTransaction>;
  owner: () => Promise<string>;
  paused: () => Promise<boolean>;
  renounceOwnership: () => Promise<ContractTransaction>;
  transferOwnership: (newOwner: string) => Promise<ContractTransaction>;
}

export type TokenContract = ethers.Contract & TokenContractMethods;
export type FactoryContract = ethers.Contract & FactoryContractMethods;
export type TokenForgeContract = ethers.Contract & TokenForgeAdminMethods;