export interface PremiumFeaturePricing {
  basePrice: bigint; // Prix de base en ETH
  setupFee: bigint; // Frais de configuration uniques
  monthlyFee: bigint; // Frais mensuels
}

export interface PremiumService {
  id: string;
  name: string;
  description: string;
  pricing: PremiumFeaturePricing;
  features: string[];
  isActive: boolean;
}

export interface ServiceSubscription {
  startTime: number; // Timestamp en millisecondes
  endTime: number; // Timestamp en millisecondes
  isActive: boolean;
}

export enum PlanType {
  Apprenti = 0,
  Forgeron = 1,
  MaitreForgeron = 2,
}

export interface ServiceAccess {
  hasLaunchpadAccess: boolean;
  hasStakingAccess: boolean;
  canCreateTokens: boolean;
  maxTokensPerMonth: number;
}
