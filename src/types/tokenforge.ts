export interface TokenForgeStats {
  totalDistributed: bigint;
  lastDistributionTime: bigint;
  isLoading: boolean;
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
  basePrice: bigint;
  setupFee: bigint;
  monthlyFee: bigint;
}
