export interface TokenForgeStats {
  totalTaxCollected: bigint;
  totalTaxToForge: bigint;
  totalTaxToDevFund: bigint;
  totalTaxToBuyback: bigint;
  totalTaxToStaking: bigint;
  totalTransactions: number;
  totalValueLocked: bigint;
  isLoading: boolean;
  taxHistory: Array<{
    timestamp: number;
    amount: bigint;
  }>;
}

export interface TaxCollectedEvent {
  from: string;
  amount: bigint;
  timestamp: bigint;
}

export interface TokenForgeConfig {
  taxRate: number;
  taxDistribution: {
    forge: number;
    devFund: number;
    buyback: number;
    staking: number;
  };
  minTokenAmount: bigint;
  maxTokenAmount: bigint;
}

export interface TokenForgeService {
  id: string;
  name: string;
  description: string;
  features: string[];
  isActive: boolean;
  pricing: {
    basePrice: bigint;
    setupFee: bigint;
    monthlyFee: bigint;
  };
}
