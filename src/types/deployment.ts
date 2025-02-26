import { Address } from 'viem';

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  taxConfig: {
    enabled: boolean;
    buyTax: number;
    sellTax: number;
    transferTax: number;
  };
}

export interface DeploymentResult {
  success: boolean;
  tokenAddress?: Address;
  transactionHash?: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CostEstimation {
  gasCost: bigint;
  tokenPrice: bigint;
  totalCost: bigint;
}

export interface TokenDeploymentOptions {
  chain: string;
  verifyContract?: boolean;
  deployerAddress?: Address;
} 