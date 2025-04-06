import { Plan, PlanType } from "../types/plans";
import { SUPPORTED_CHAINS } from "@/config/constants/chains";

export const PLAN_FEATURES = {
  TOKEN_CREATION: {
    id: "token_creation",
    name: "Création de Token",
    description: "Créez votre propre token personnalisé",
  },
  MINT: {
    id: "mint",
    name: "Fonction Mint",
    description: "Possibilité de créer de nouveaux tokens",
  },
  BURN: {
    id: "burn",
    name: "Fonction Burn",
    description: "Possibilité de brûler des tokens",
  },
  BLACKLIST: {
    id: "blacklist",
    name: "Liste Noire",
    description: "Gestion des adresses interdites",
  },
  OWNERSHIP: {
    id: "ownership",
    name: "Gestion de la Propriété",
    description: "Transfert et renonciation de la propriété du contrat",
  },
  CUSTOM_TAX: {
    id: "custom_tax",
    name: "Taxe Personnalisée",
    description: "Configuration de taxes sur les transactions",
  },
  PRIORITY_SUPPORT: {
    id: "priority_support",
    name: "Support Prioritaire",
    description: "Accès à un support technique prioritaire",
  },
};

export const PLANS: Plan[] = [
  {
    id: PlanType.APPRENTI,
    name: "Apprenti Forgeron",
    description: "Parfait pour débuter et tester vos tokens",
    price: {
      amount: 0,
      currency: "ETH",
    },
    features: [
      { ...PLAN_FEATURES.TOKEN_CREATION, included: true },
      { ...PLAN_FEATURES.MINT, included: false },
      { ...PLAN_FEATURES.BURN, included: false },
      { ...PLAN_FEATURES.BLACKLIST, included: false },
      { ...PLAN_FEATURES.OWNERSHIP, included: true },
      { ...PLAN_FEATURES.CUSTOM_TAX, included: false },
      { ...PLAN_FEATURES.PRIORITY_SUPPORT, included: false },
    ],
    limitations: {
      networks: ["goerli", "mumbai", "sepolia"],
      maxTokens: 3,
      maxTransactions: 1000,
      testnetOnly: true,
    },
  },
  {
    id: PlanType.FORGERON,
    name: "Forgeron",
    description: "Pour les créateurs de tokens sérieux",
    price: {
      amount: 0.2,
      currency: "BNB",
    },
    features: [
      { ...PLAN_FEATURES.TOKEN_CREATION, included: true },
      { ...PLAN_FEATURES.MINT, included: true },
      { ...PLAN_FEATURES.BURN, included: true },
      { ...PLAN_FEATURES.BLACKLIST, included: true },
      { ...PLAN_FEATURES.OWNERSHIP, included: true },
      { ...PLAN_FEATURES.CUSTOM_TAX, included: true },
      { ...PLAN_FEATURES.PRIORITY_SUPPORT, included: false },
    ],
    limitations: {
      networks: Object.values(SUPPORTED_CHAINS).map((chain) => chain.name),
      maxCustomFunctions: 2,
    },
    recommended: true,
  },
  {
    id: PlanType.MAITRE_FORGERON,
    name: "Maître Forgeron",
    description: "Fonctionnalités avancées et support prioritaire",
    price: {
      amount: 0.5,
      currency: "BNB",
    },
    features: [
      { ...PLAN_FEATURES.TOKEN_CREATION, included: true },
      { ...PLAN_FEATURES.MINT, included: true },
      { ...PLAN_FEATURES.BURN, included: true },
      { ...PLAN_FEATURES.BLACKLIST, included: true },
      { ...PLAN_FEATURES.OWNERSHIP, included: true },
      { ...PLAN_FEATURES.CUSTOM_TAX, included: true },
      { ...PLAN_FEATURES.PRIORITY_SUPPORT, included: true },
    ],
    limitations: {
      networks: Object.values(SUPPORTED_CHAINS).map((chain) => chain.name),
    },
  },
];
