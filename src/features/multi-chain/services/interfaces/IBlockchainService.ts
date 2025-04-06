import { Address } from "viem";

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  address: Address;
}

export interface IBlockchainService {
  // Informations de base
  getBalance(address: Address): Promise<bigint>;
  getNativeTokenPrice(): Promise<number>;

  // Gestion des tokens
  createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: Address;
  }): Promise<Address>; // Retourne l'adresse du contrat

  // Informations sur les tokens
  getTokenInfo(tokenAddress: Address): Promise<TokenInfo>;

  // Gestion de la liquidité
  addLiquidity(params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean>;

  removeLiquidity(params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean>;

  // Staking
  stake(params: {
    tokenAddress: Address;
    amount: bigint;
    duration?: number;
  }): Promise<boolean>;

  unstake(params: { tokenAddress: Address; amount: bigint }): Promise<boolean>;

  // Validation et estimation
  validateAddress(address: string): boolean;

  estimateFees(params: {
    to: Address;
    value?: bigint;
    data?: `0x${string}`;
  }): Promise<bigint>;
}
