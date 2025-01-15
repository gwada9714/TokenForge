export enum UserLevel {
  APPRENTICE = 'apprentice',
  FORGE = 'forge',
  MASTER = 'master',
  DEVELOPER = 'developer'
}

export interface TokenFeatures {
  // Fonctionnalités de base
  customTax: boolean;
  renounceOwnership: boolean;
  // Fonctionnalités avancées
  mintable: boolean;
  burnable: boolean;
  antiWhale: boolean;
  whitelist: boolean;
  blacklist: boolean;
  // Fonctionnalités de sécurité
  audit: boolean;
  liquidityLock: boolean;
}

export interface ServiceAccess {
  launchpad: boolean;
  staking: boolean;
  marketing: boolean;
  kyc: boolean;
}

export interface PlanFeatures {
  // Limites et permissions
  canDeployMainnet: boolean;
  maxTokensPerDay: number;
  maxCustomModules: number;
  // Fonctionnalités disponibles
  tokenFeatures: TokenFeatures;
  serviceAccess: ServiceAccess;
  // Support et assistance
  prioritySupport: boolean;
  communityAccess: boolean;
  apiAccess: boolean;
}

export interface Plan {
  level: UserLevel;
  name: string;
  description: string;
  price: {
    bnb: number;
    tkn: number;
  };
  features: PlanFeatures;
}

export const DEFAULT_PLANS: Record<UserLevel, Plan> = {
  [UserLevel.APPRENTICE]: {
    level: UserLevel.APPRENTICE,
    name: "Apprenti Forgeron",
    description: "Parfait pour débuter et apprendre",
    price: {
      bnb: 0,
      tkn: 0
    },
    features: {
      canDeployMainnet: false,
      maxTokensPerDay: 3,
      maxCustomModules: 0,
      tokenFeatures: {
        customTax: false,
        renounceOwnership: false,
        mintable: false,
        burnable: false,
        antiWhale: false,
        whitelist: false,
        blacklist: false,
        audit: false,
        liquidityLock: false
      },
      serviceAccess: {
        launchpad: false,
        staking: false,
        marketing: false,
        kyc: false
      },
      prioritySupport: false,
      communityAccess: true,
      apiAccess: false
    }
  },
  [UserLevel.FORGE]: {
    level: UserLevel.FORGE,
    name: "Forgeron",
    description: "Pour les créateurs de tokens expérimentés",
    price: {
      bnb: 0.3,
      tkn: 1000
    },
    features: {
      canDeployMainnet: true,
      maxTokensPerDay: 5,
      maxCustomModules: 2,
      tokenFeatures: {
        customTax: true,
        renounceOwnership: true,
        mintable: true,
        burnable: true,
        antiWhale: false,
        whitelist: false,
        blacklist: false,
        audit: true,
        liquidityLock: true
      },
      serviceAccess: {
        launchpad: false,
        staking: true,
        marketing: false,
        kyc: false
      },
      prioritySupport: false,
      communityAccess: true,
      apiAccess: false
    }
  },
  [UserLevel.MASTER]: {
    level: UserLevel.MASTER,
    name: "Maître Forgeron",
    description: "Contrôle total et personnalisation avancée",
    price: {
      bnb: 1,
      tkn: 3000
    },
    features: {
      canDeployMainnet: true,
      maxTokensPerDay: 10,
      maxCustomModules: -1, // illimité
      tokenFeatures: {
        customTax: true,
        renounceOwnership: true,
        mintable: true,
        burnable: true,
        antiWhale: true,
        whitelist: true,
        blacklist: true,
        audit: true,
        liquidityLock: true
      },
      serviceAccess: {
        launchpad: true,
        staking: true,
        marketing: true,
        kyc: true
      },
      prioritySupport: true,
      communityAccess: true,
      apiAccess: true
    }
  },
  [UserLevel.DEVELOPER]: {
    level: UserLevel.DEVELOPER,
    name: "Forgeron du Code",
    description: "Accès API et intégration personnalisée",
    price: {
      bnb: 2,
      tkn: 5000
    },
    features: {
      canDeployMainnet: true,
      maxTokensPerDay: -1, // illimité
      maxCustomModules: -1, // illimité
      tokenFeatures: {
        customTax: true,
        renounceOwnership: true,
        mintable: true,
        burnable: true,
        antiWhale: true,
        whitelist: true,
        blacklist: true,
        audit: true,
        liquidityLock: true
      },
      serviceAccess: {
        launchpad: true,
        staking: true,
        marketing: true,
        kyc: true
      },
      prioritySupport: true,
      communityAccess: true,
      apiAccess: true
    }
  }
};
