import { NetworkConfig } from '@/features/auth/types/wallet';
import { PaymentCurrency } from '@/features/pricing/types/plans';

export enum ServiceType {
  LAUNCHPAD = 'LAUNCHPAD',
  STAKING = 'STAKING',
  MARKETING = 'MARKETING',
  KYC = 'KYC'
}

export interface NetworkFees {
  launchpadPercentage: number;
  stakingPercentage: number;
}

export interface ServiceFeature {
  id: string;
  name: string;
  description: string;
}

export interface BaseServicePrice {
  currency: PaymentCurrency | 'USD';
}

export interface LaunchpadPrice extends BaseServicePrice {
  baseFee: number;
  networkFees: Record<string, NetworkFees>;
}

export interface StakingPrice extends BaseServicePrice {
  baseFee: number;
  rewardPercentage: number;
}

export interface MarketingPrice extends BaseServicePrice {
  baseFee: number;
  listingCommission: number;
}

export interface KYCPrice extends BaseServicePrice {
  verificationFee: number;
}

export type ServicePrice = LaunchpadPrice | StakingPrice | MarketingPrice | KYCPrice;

export interface Service {
  id: ServiceType;
  name: string;
  description: string;
  price: ServicePrice;
  features: ServiceFeature[];
  networks: string[];
}

// Types spécifiques pour chaque service
export interface LaunchpadConfig {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  auditLevel: 'basic' | 'standard' | 'premium';
}

export interface StakingConfig {
  apr: string;
  stakingPeriod: string;
  rewardToken: string;
  compoundingEnabled: boolean;
}

export interface MarketingConfig {
  projectName: string;
  description: string;
  socialMedia: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  influencerCampaign: {
    budget: number;
    objectives?: string;
  };
  prCampaign: {
    type: string;
    keyPoints?: string;
  };
}

export interface KYCConfig {
  kycType: 'individual' | 'business';
  verificationLevel: 'basic' | 'advanced' | 'premium';
  requirements: {
    idDocument?: boolean;
    proofOfAddress?: boolean;
    selfie?: boolean;
    companyDocuments?: boolean;
    directorIds?: boolean;
    shareholderInfo?: boolean;
  };
}

export interface ServiceRequest {
  serviceType: ServiceType;
  network: NetworkConfig;
  config: LaunchpadConfig | StakingConfig | MarketingConfig | KYCConfig;
  payment: {
    amount: number;
    currency: PaymentCurrency | 'USD';
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
}

export interface ServiceQuote {
  serviceType: ServiceType;
  baseAmount: number;
  percentageFee: number;
  totalAmount: number;
  currency: PaymentCurrency;
  validUntil: number;
} 