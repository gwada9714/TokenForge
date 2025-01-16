import { formatEther, parseEther } from 'ethers';

export interface PremiumFeaturePricing {
  basePrice: number;  // en ETH
  setupFee: number;   // en ETH
  monthlyFee: number; // en ETH
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  pricing: PremiumFeaturePricing;
  requiredTier: 'maitre-forgeron';
}

export class PremiumFeaturesService {
  private static readonly features: PremiumFeature[] = [
    {
      id: 'launchpad',
      name: 'Launchpad Personnalisé',
      description: 'Créez votre propre plateforme de lancement de tokens avec whitelist et vesting.',
      pricing: {
        basePrice: 3,    // 3 ETH
        setupFee: 0.5,   // 0.5 ETH
        monthlyFee: 0.1  // 0.1 ETH
      },
      requiredTier: 'maitre-forgeron'
    },
    {
      id: 'staking',
      name: 'Plateforme de Staking',
      description: 'Plateforme de staking dédiée avec APY personnalisable et périodes de lock.',
      pricing: {
        basePrice: 2,    // 2 ETH
        setupFee: 0.3,   // 0.3 ETH
        monthlyFee: 0.05 // 0.05 ETH
      },
      requiredTier: 'maitre-forgeron'
    }
  ];

  public static getFeatures(): PremiumFeature[] {
    return this.features;
  }

  public static getFeatureById(featureId: string): PremiumFeature | undefined {
    return this.features.find(feature => feature.id === featureId);
  }

  public static calculateTotalCost(featureId: string, months: number = 1): string {
    const feature = this.getFeatureById(featureId);
    if (!feature) return '0';

    const totalCost = feature.pricing.basePrice + 
                     feature.pricing.setupFee + 
                     (feature.pricing.monthlyFee * months);
    
    return parseEther(totalCost.toString()).toString();
  }

  public static isFeatureAvailable(featureId: string, userTier: string): boolean {
    const feature = this.getFeatureById(featureId);
    if (!feature) return false;

    return userTier === feature.requiredTier;
  }
}
