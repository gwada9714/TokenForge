import { BigNumber } from 'ethers';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: BigNumber;
  address: string;
}

export interface IBlockchainService {
  // Informations de base
  getBalance(address: string): Promise<BigNumber>;
  getNativeTokenPrice(): Promise<number>;
  
  // Gestion des tokens
  createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: string;
  }): Promise<string>; // Retourne l'adresse du contrat

  // Informations sur les tokens
  getTokenInfo(tokenAddress: string): Promise<TokenInfo>;
  
  // Gestion de la liquidité
  addLiquidity(params: {
    tokenAddress: string;
    amount: string;
    deadline?: number;
  }): Promise<boolean>;
  
  removeLiquidity(params: {
    tokenAddress: string;
    amount: string;
    deadline?: number;
  }): Promise<boolean>;

  // Staking
  stake(params: {
    tokenAddress: string;
    amount: string;
    duration?: number;
  }): Promise<boolean>;
  
  unstake(params: {
    tokenAddress: string;
    amount: string;
  }): Promise<boolean>;

  // Utilitaires
  validateAddress(address: string): boolean;
  estimateFees(params: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<BigNumber>;
}
