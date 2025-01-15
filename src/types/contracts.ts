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

export type TokenContract = ethers.Contract & TokenContractMethods;
export type FactoryContract = ethers.Contract & FactoryContractMethods;