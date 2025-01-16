export interface ServiceTierFeature {
  name: string;
  description: string;
  included: boolean;
}

export interface ServiceTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: ServiceTierFeature[];
  recommended?: boolean;
}

export class ServiceTierService {
  private static readonly tiers: ServiceTier[] = [
    {
      id: 'forgeron',
      name: 'Forgeron',
      description: 'Pour les créateurs de tokens débutants',
      price: 0.5, // en ETH
      features: [
        {
          name: 'Création de Token',
          description: 'Création et déploiement de token standard',
          included: true
        },
        {
          name: 'Fonctions de Base',
          description: 'Mint, Burn, et fonctions standard ERC20',
          included: true
        },
        {
          name: 'Support Email',
          description: 'Support technique par email sous 48h',
          included: true
        },
        {
          name: 'Launchpad',
          description: 'Création de launchpad personnalisé',
          included: false
        },
        {
          name: 'Staking',
          description: 'Plateforme de staking dédiée',
          included: false
        }
      ]
    },
    {
      id: 'maitre-forgeron',
      name: 'Maître Forgeron',
      description: 'Pour les projets professionnels',
      price: 2, // en ETH
      recommended: true,
      features: [
        {
          name: 'Création de Token',
          description: 'Création et déploiement de token avancé',
          included: true
        },
        {
          name: 'Fonctions Avancées',
          description: 'Toutes les fonctions standard plus les fonctions avancées',
          included: true
        },
        {
          name: 'Support Prioritaire',
          description: 'Support technique par email sous 24h',
          included: true
        },
        {
          name: 'Launchpad',
          description: 'Création de launchpad personnalisé',
          included: true
        },
        {
          name: 'Staking',
          description: 'Plateforme de staking dédiée',
          included: true
        }
      ]
    }
  ];

  public static getTiers(): ServiceTier[] {
    return this.tiers;
  }

  public static getTierById(tierId: string): ServiceTier | undefined {
    return this.tiers.find(tier => tier.id === tierId);
  }

  public static getTierPrice(tierId: string): number {
    const tier = this.getTierById(tierId);
    return tier ? tier.price : 0;
  }

  public static getTierFeatures(tierId: string): ServiceTierFeature[] {
    const tier = this.getTierById(tierId);
    return tier ? tier.features : [];
  }
}
