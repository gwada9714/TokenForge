export type PaymentCurrency = "BNB" | "ETH" | "MATIC" | "USDT" | "USDC";

export enum ServiceType {
  LAUNCHPAD = "LAUNCHPAD",
  STAKING = "STAKING",
  MARKETING = "MARKETING",
  KYC = "KYC",
}

export interface ServicePrice {
  baseFee: number;
  currency: PaymentCurrency;
  percentageFee?: number;
}

export interface ServiceFeature {
  id: string;
  name: string;
  description: string;
}

export interface Service {
  id: ServiceType;
  name: string;
  description: string;
  price: ServicePrice;
  features: ServiceFeature[];
  networks: string[];
}

export interface MarketingConfig {
  projectName: string;
  projectDescription: string;
  socialMedia: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    medium?: string;
  };
  influencerCampaign: {
    budget: string;
    objectives: string;
  };
  prCampaign: {
    type: string;
    keyPoints: string;
  };
}
