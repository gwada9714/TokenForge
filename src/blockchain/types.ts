/**
 * Types partagés pour l'intégration blockchain
 */

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number | bigint;
  maxSupply?: number | bigint;
  antiWhale?: {
    enabled: boolean;
    maxTransferPercent?: number;
    excludedAddresses?: string[];
  };
  burnable?: boolean;
  mintable?: boolean;
  taxable?: {
    enabled: boolean;
    buyTaxPercent?: number;
    sellTaxPercent?: number;
    transferTaxPercent?: number;
    taxRecipient?: string;
  };
}

export interface DeploymentResult {
  transactionHash: string;
  tokenAddress: string;
  chainId: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  // Autres informations du token
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface LiquidityConfig {
  pairWith: string; // Adresse du token de paire (e.g., WETH, WBNB)
  initialLiquidityAmount: bigint;
  lockPeriod?: number; // en secondes
  // Autres configs pour la liquidité
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  details: Record<string, any>;
}
