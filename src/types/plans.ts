import { parseEther, formatEther } from "viem";

export enum PlanType {
  Apprenti = 0,
  Forgeron = 1,
  MaitreForgeron = 2,
}

export enum UserLevel {
  APPRENTICE = 0,
  BLACKSMITH = 1,
  MASTER_BLACKSMITH = 2,
}

export interface PlanDetails {
  name: string;
  description: string;
  features: string[];
  includesAudit: boolean;
  defaultForgeTax: boolean;
}

export interface PlanPricing {
  bnbPrice: string;
  priceInWei: bigint;
}

// Fonction utilitaire pour créer un prix avec validation
const createPrice = (bnbPrice: string): PlanPricing => {
  try {
    const priceInWei = parseEther(bnbPrice);
    return {
      bnbPrice,
      priceInWei,
    };
  } catch (error) {
    throw new Error(`Prix invalide: ${bnbPrice} BNB`);
  }
};

// Prix en BNB avec conversion Wei pré-calculée
export const PLAN_PRICES: Record<PlanType, PlanPricing> = {
  [PlanType.Apprenti]: createPrice("0"),
  [PlanType.Forgeron]: createPrice("0.3"),
  [PlanType.MaitreForgeron]: createPrice("1"),
};

// Prix en BNB (sera converti en wei pour le contrat)
export const DEFAULT_PLANS: Record<PlanType, PlanDetails> = {
  [PlanType.Apprenti]: {
    name: "Apprenti Forgeron",
    description: "Commencez votre voyage dans la forge de tokens",
    features: [
      "Création de token ERC20 basique",
      "Support communautaire",
      "Documentation détaillée",
      "Déploiement sur testnet",
    ],
    includesAudit: false,
    defaultForgeTax: false,
  },
  [PlanType.Forgeron]: {
    name: "Forgeron",
    description: "Forgez des tokens avancés avec plus de fonctionnalités",
    features: [
      "Toutes les fonctionnalités Apprenti",
      "Fonctions avancées (Mint, Burn, Pause)",
      "Verrouillage de liquidité",
      "Support prioritaire",
      "Audit de sécurité basique",
    ],
    includesAudit: false,
    defaultForgeTax: false,
  },
  [PlanType.MaitreForgeron]: {
    name: "Maître Forgeron",
    description: "Devenez un maître dans l'art de la forge de tokens",
    features: [
      "Toutes les fonctionnalités Forgeron",
      "Tokenomics personnalisée",
      "Audit de sécurité complet",
      "Support dédié 24/7",
      "Listing sur DEX automatisé",
      "Marketing package",
    ],
    includesAudit: true,
    defaultForgeTax: true,
  },
};

// Obtenir le prix en Wei avec validation
export const getPlanPriceInWei = (planType: PlanType): bigint => {
  const pricing = PLAN_PRICES[planType];
  if (!pricing) {
    throw new Error(`Plan type invalide: ${planType}`);
  }
  return pricing.priceInWei;
};

// Vérifier si le prix correspond au prix attendu
export const validatePlanPrice = (
  planType: PlanType,
  price: bigint
): boolean => {
  const expectedPrice = getPlanPriceInWei(planType);
  return price === expectedPrice;
};

// Formatter le prix en BNB lisible
export const formatPlanPrice = (planType: PlanType): string => {
  const pricing = PLAN_PRICES[planType];
  return `${pricing.bnbPrice} BNB`;
};
