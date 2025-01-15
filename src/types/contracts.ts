import { ethers } from 'ethers';

export interface TokenContractMethods {
  transfer: (to: string, amount: bigint) => Promise<ethers.ContractTransactionResponse>;
  mint: (to: string, amount: bigint) => Promise<ethers.ContractTransactionResponse>;
  burn: (amount: bigint) => Promise<ethers.ContractTransactionResponse>;
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
  ) => Promise<ethers.ContractTransactionResponse>;
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
  totalSupply: string;
  decimals: string;
  owner: string;
  isBurnable: boolean;
  isMintable: boolean;
  taxConfig: TaxConfig;
}

export interface TokenData extends TokenConfig {
  address: string;
  burned: boolean;
}

export type TokenContract = ethers.Contract & TokenContractMethods;
export type FactoryContract = ethers.Contract & FactoryContractMethods;