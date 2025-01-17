import { parseEther } from 'viem';

export enum PlanType {
  Apprenti = 0,
  Forgeron = 1,
  MaitreForgeron = 2
}

export interface PlanDetails {
  name: string;
  description: string;
  bnbPrice: string;
  tknPrice: string;
  features: string[];
  includesAudit: boolean;
  defaultForgeTax: boolean;
}

// Prix en BNB (sera converti en wei pour le contrat)
export const DEFAULT_PLANS: Record<PlanType, PlanDetails> = {
  [PlanType.Apprenti]: {
    name: "Apprenti Forgeron",
    description: "Commencez votre voyage dans la forge de tokens",
    bnbPrice: "0",
    tknPrice: "0",
    features: [
      'Création de token ERC20 basique',
      'Support communautaire',
      'Documentation détaillée',
      'Déploiement sur testnet'
    ],
    includesAudit: false,
    defaultForgeTax: false
  },
  [PlanType.Forgeron]: {
    name: "Forgeron",
    description: "Forgez des tokens avancés avec plus de fonctionnalités",
    bnbPrice: "0.3",
    tknPrice: "1000",
    features: [
      'Toutes les fonctionnalités Apprenti',
      'Fonctions avancées (Mint, Burn, Pause)',
      'Verrouillage de liquidité',
      'Support prioritaire',
      'Audit de sécurité basique'
    ],
    includesAudit: false,
    defaultForgeTax: false
  },
  [PlanType.MaitreForgeron]: {
    name: "Maître Forgeron",
    description: "Devenez un maître dans l'art de la forge de tokens",
    bnbPrice: "1",
    tknPrice: "3000",
    features: [
      'Toutes les fonctionnalités Forgeron',
      'Tokenomics personnalisée',
      'Audit de sécurité complet',
      'Support dédié 24/7',
      'Listing sur DEX automatisé',
      'Marketing package'
    ],
    includesAudit: true,
    defaultForgeTax: true
  }
};

// Convertit les prix en wei pour le contrat
export const getPlanPriceInWei = (planType: PlanType): bigint => {
  const plan = DEFAULT_PLANS[planType];
  return parseEther(plan.bnbPrice);
};
