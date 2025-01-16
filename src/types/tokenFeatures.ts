export interface TaxConfig {
  enabled: boolean;
  buyTax: number;
  sellTax: number;
  transferTax: number;
  forgeShare: number;
  redistributionShare: number;
  liquidityShare: number;
  burnShare: number;
  recipient: string;
  distribution: {
    treasury: number;
    development: number;
    buyback: number;
    staking: number;
  };
}

export interface LiquidityLock {
  enabled: boolean;
  amount: string;
  unlockDate: number;
  beneficiary: string;
}

export interface MaxLimits {
  maxWallet: {
    enabled: boolean;
    amount: string;
    percentage: number;
  };
  maxTransaction: {
    enabled: boolean;
    amount: string;
    percentage: number;
  };
}

export interface AntiBot {
  enabled: boolean;
  maxTransactionsPerBlock: number;
  maxGasPrice: string;
  excludedAddresses: string[];
}

export interface TokenAudit {
  timestamp: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  score: number;
}

export interface KYCVerification {
  status: 'pending' | 'verified' | 'rejected';
  provider: string;
  date?: number;
  expiryDate?: number;
  verificationId?: string;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  taxes: TaxConfig;
  liquidityLock: LiquidityLock;
  maxLimits: MaxLimits;
  antiBot: AntiBot;
  audit?: TokenAudit;
  kyc?: KYCVerification;
  features: {
    burnable: boolean;
    mintable: boolean;
    pausable: boolean;
    blacklist: boolean;
    forceTransfer: boolean;
    deflation: boolean;
    reflection: boolean;
  };
}

export interface TokenFeatures {
  taxes: TaxConfig;
  liquidityLock: LiquidityLock;
  maxLimits: MaxLimits;
  antiBot: AntiBot;
  audit?: TokenAudit;
  kyc?: KYCVerification;
  features: {
    burnable: boolean;
    mintable: boolean;
    pausable: boolean;
    blacklist: boolean;
    forceTransfer: boolean;
    deflation: boolean;
    reflection: boolean;
  };
}
