import {
  Service,
  ServiceType,
  ServiceFeature,
  NetworkFees,
} from "../types/services";
import { SUPPORTED_CHAINS } from "@/config/constants/chains";

export const SERVICE_FEATURES = {
  LAUNCHPAD: {
    PRESALE: {
      id: "presale",
      name: "Configuration complète de la presale",
      description: "Mise en place et configuration de votre presale",
    },
    VESTING: {
      id: "vesting",
      name: "Système de vesting personnalisable",
      description: "Configuration des périodes de vesting selon vos besoins",
    },
    WHITELIST: {
      id: "whitelist",
      name: "Gestion de whitelist",
      description: "Système de whitelist pour vos investisseurs privilégiés",
    },
    AUDIT: {
      id: "audit",
      name: "Audit de sécurité basique",
      description: "Vérification de la sécurité de votre smart contract",
    },
  },
  STAKING: {
    FLEXIBLE: {
      id: "flexible",
      name: "Staking flexible",
      description: "Staking sans période de blocage",
    },
    LOCKED: {
      id: "locked",
      name: "Staking verrouillé",
      description:
        "Staking avec période de blocage pour de meilleurs rendements",
    },
    REWARDS: {
      id: "rewards",
      name: "Récompenses personnalisables",
      description: "Configuration flexible des récompenses de staking",
    },
    MULTI_TOKEN: {
      id: "multi_token",
      name: "Support multi-tokens",
      description: "Possibilité de staker différents tokens",
    },
  },
  MARKETING: {
    SOCIAL: {
      id: "social",
      name: "Marketing Social",
      description: "Gestion des réseaux sociaux et communauté",
    },
    INFLUENCERS: {
      id: "influencers",
      name: "Partenariats Influenceurs",
      description: "Mise en relation avec des influenceurs crypto",
    },
    PR: {
      id: "pr",
      name: "Relations Publiques",
      description: "Articles et communiqués de presse",
    },
    LISTING: {
      id: "listing",
      name: "Listing CEX/DEX",
      description: "Assistance pour le listing sur les exchanges",
    },
  },
  KYC: {
    BASIC: {
      id: "basic_kyc",
      name: "KYC Standard",
      description: "Vérification d'identité standard",
    },
    ADVANCED: {
      id: "advanced_kyc",
      name: "KYC Avancé",
      description:
        "Vérification d'identité approfondie avec validation supplémentaire",
    },
  },
};

export const NETWORK_FEES: Record<string, NetworkFees> = {
  ethereum: { launchpadPercentage: 3, stakingPercentage: 5 },
  bsc: { launchpadPercentage: 2, stakingPercentage: 5 },
  polygon: { launchpadPercentage: 2, stakingPercentage: 5 },
  avalanche: { launchpadPercentage: 2, stakingPercentage: 5 },
  solana: { launchpadPercentage: 1.5, stakingPercentage: 5 },
  arbitrum: { launchpadPercentage: 1.5, stakingPercentage: 5 },
};

export const SERVICES: Service[] = [
  {
    id: ServiceType.LAUNCHPAD,
    name: "Launchpad",
    description:
      "Lancez votre token avec une presale sécurisée et professionnelle",
    price: {
      baseFee: 0.1, // BNB
      networkFees: NETWORK_FEES,
      currency: "BNB",
    },
    features: [
      SERVICE_FEATURES.LAUNCHPAD.PRESALE,
      SERVICE_FEATURES.LAUNCHPAD.VESTING,
      SERVICE_FEATURES.LAUNCHPAD.WHITELIST,
      SERVICE_FEATURES.LAUNCHPAD.AUDIT,
    ],
    networks: Object.values(SUPPORTED_CHAINS).map((chain) => chain.name),
  },
  {
    id: ServiceType.STAKING,
    name: "Staking",
    description: "Créez votre propre plateforme de staking personnalisée",
    price: {
      baseFee: 0.05, // BNB par pool
      rewardPercentage: 5, // 5% des récompenses générées
      currency: "BNB",
    },
    features: [
      SERVICE_FEATURES.STAKING.FLEXIBLE,
      SERVICE_FEATURES.STAKING.LOCKED,
      SERVICE_FEATURES.STAKING.REWARDS,
      SERVICE_FEATURES.STAKING.MULTI_TOKEN,
    ],
    networks: Object.values(SUPPORTED_CHAINS).map((chain) => chain.name),
  },
  {
    id: ServiceType.MARKETING,
    name: "Marketing",
    description:
      "Boostez la visibilité de votre projet avec notre expertise marketing",
    price: {
      baseFee: 0.5, // BNB minimum
      listingCommission: 5, // 5% sur les listings réussis
      currency: "BNB",
    },
    features: [
      SERVICE_FEATURES.MARKETING.SOCIAL,
      SERVICE_FEATURES.MARKETING.INFLUENCERS,
      SERVICE_FEATURES.MARKETING.PR,
      SERVICE_FEATURES.MARKETING.LISTING,
    ],
    networks: Object.values(SUPPORTED_CHAINS).map((chain) => chain.name),
  },
  {
    id: ServiceType.KYC,
    name: "KYC",
    description: "Service de vérification d'identité pour votre projet",
    price: {
      verificationFee: 50, // USD par vérification
      currency: "USD",
    },
    features: [SERVICE_FEATURES.KYC.BASIC, SERVICE_FEATURES.KYC.ADVANCED],
    networks: Object.values(SUPPORTED_CHAINS).map((chain) => chain.name),
  },
];

// Utilitaires pour la gestion des services
export const getServiceById = (id: ServiceType): Service | undefined => {
  return SERVICES.find((service) => service.id === id);
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
