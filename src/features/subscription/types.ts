export enum SubscriptionTier {
  APPRENTI = 'apprenti',
  FORGERON = 'forgeron',
  MAITRE = 'maitre'
}

export interface SubscriptionFeatures {
  canDeployMainnet: boolean;
  hasMintBurn: boolean;
  hasBlacklist: boolean;
  hasAdvancedFeatures: boolean;
  maxCustomTax: number;
  prioritySupport: boolean;
}

export interface Subscription {
  tier: SubscriptionTier;
  features: SubscriptionFeatures;
  price: {
    amount: string;
    currency: string;
  };
}
