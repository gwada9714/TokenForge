import { Service, ServiceType, ServiceFeature } from '../types/services';
import { SUPPORTED_CHAINS } from '@/config/constants/chains';

export const SERVICE_FEATURES = {
  LAUNCHPAD: {
    PRESALE: {
      id: 'presale',
      name: 'Configuration complète de la presale',
      description: 'Mise en place et configuration de votre presale'
    },
    VESTING: {
      id: 'vesting',
      name: 'Système de vesting personnalisable',
      description: 'Configuration des périodes de vesting selon vos besoins'
    },
    WHITELIST: {
      id: 'whitelist',
      name: 'Gestion de whitelist',
      description: 'Système de whitelist pour vos investisseurs privilégiés'
    },
    AUDIT: {
      id: 'audit',
      name: 'Audit de sécurité basique',
      description: 'Vérification de la sécurité de votre smart contract'
    }
  },
  STAKING: {
    FLEXIBLE: {
      id: 'flexible',
      name: 'Staking flexible',
      description: 'Staking sans période de blocage'
    },
    LOCKED: {
      id: 'locked',
      name: 'Staking verrouillé',
      description: 'Staking avec période de blocage pour de meilleurs rendements'
    },
    REWARDS: {
      id: 'rewards',
      name: 'Récompenses personnalisables',
      description: 'Configuration flexible des récompenses de staking'
    },
    MULTI_TOKEN: {
      id: 'multi_token',
      name: 'Support multi-tokens',
      description: 'Possibilité de staker différents tokens'
    }
  },
  MARKETING: {
    SOCIAL: {
      id: 'social',
      name: 'Gestion des réseaux sociaux',
      description: 'Gestion professionnelle de vos réseaux sociaux'
    },
    INFLUENCERS: {
      id: 'influencers',
      name: 'Partenariats influenceurs',
      description: 'Mise en relation avec des influenceurs crypto'
    },
    PR: {
      id: 'pr',
      name: 'Relations publiques',
      description: 'Articles et communiqués de presse'
    },
    LISTING: {
      id: 'listing',
      name: 'Listing sur CoinGecko/CMC',
      description: 'Accompagnement pour le listing sur les agrégateurs'
    }
  },
  KYC: {
    INDIVIDUAL: {
      id: 'individual',
      name: 'Vérification individuelle',
      description: 'KYC pour les particuliers'
    },
    TEAM: {
      id: 'team',
      name: 'Vérification de l\'équipe',
      description: 'KYC pour les membres de l\'équipe'
    },
    COMPANY: {
      id: 'company',
      name: 'Vérification d\'entreprise',
      description: 'KYC pour les entités juridiques'
    },
    AUDIT: {
      id: 'audit',
      name: 'Audit de conformité',
      description: 'Vérification complète de la conformité réglementaire'
    }
  }
};

export const SERVICES: Service[] = [
  {
    id: ServiceType.LAUNCHPAD,
    name: 'Launchpad',
    description: 'Lancez votre token avec une presale sécurisée et professionnelle',
    price: {
      baseFee: 2,
      currency: 'ETH',
      percentageFee: 2, // 2% des fonds levés
    },
    features: [
      SERVICE_FEATURES.LAUNCHPAD.PRESALE,
      SERVICE_FEATURES.LAUNCHPAD.VESTING,
      SERVICE_FEATURES.LAUNCHPAD.WHITELIST,
      SERVICE_FEATURES.LAUNCHPAD.AUDIT,
    ],
    networks: Object.values(SUPPORTED_CHAINS).map(chain => chain.name),
  },
  {
    id: ServiceType.STAKING,
    name: 'Staking',
    description: 'Créez votre propre plateforme de staking personnalisée',
    price: {
      baseFee: 1.5,
      currency: 'ETH',
      percentageFee: 1, // 1% des récompenses
    },
    features: [
      SERVICE_FEATURES.STAKING.FLEXIBLE,
      SERVICE_FEATURES.STAKING.LOCKED,
      SERVICE_FEATURES.STAKING.REWARDS,
      SERVICE_FEATURES.STAKING.MULTI_TOKEN,
    ],
    networks: Object.values(SUPPORTED_CHAINS).map(chain => chain.name),
  },
  {
    id: ServiceType.MARKETING,
    name: 'Marketing',
    description: 'Boostez la visibilité de votre projet avec notre expertise marketing',
    price: {
      baseFee: 5,
      currency: 'ETH',
    },
    features: [
      SERVICE_FEATURES.MARKETING.SOCIAL,
      SERVICE_FEATURES.MARKETING.INFLUENCERS,
      SERVICE_FEATURES.MARKETING.PR,
      SERVICE_FEATURES.MARKETING.LISTING,
    ],
    networks: Object.values(SUPPORTED_CHAINS).map(chain => chain.name),
  },
  {
    id: ServiceType.KYC,
    name: 'KYC & Audit',
    description: 'Renforcez la confiance avec une vérification KYC complète',
    price: {
      baseFee: 1,
      currency: 'ETH',
    },
    features: [
      SERVICE_FEATURES.KYC.INDIVIDUAL,
      SERVICE_FEATURES.KYC.TEAM,
      SERVICE_FEATURES.KYC.COMPANY,
      SERVICE_FEATURES.KYC.AUDIT,
    ],
    networks: Object.values(SUPPORTED_CHAINS).map(chain => chain.name),
  },
];

// Utilitaires pour la gestion des services
export const getServiceById = (id: ServiceType): Service | undefined => {
  return SERVICES.find(service => service.id === id);
};

export const calculateServicePrice = (
  service: Service,
  amount?: number
): number => {
  let total = service.price.baseFee;
  
  if (service.price.percentageFee && amount) {
    total += (amount * service.price.percentageFee) / 100;
  }
  
  return total;
};

export const isServiceAvailableOnNetwork = (
  service: Service,
  networkName: string
): boolean => {
  return service.networks.includes(networkName);
}; 