export enum UserLevel {
  APPRENTICE = 'APPRENTICE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM'
}

export interface PlanDetails {
  name: string;
  price: {
    tkn: number;
    bnb: number;
  };
  features: string[];
}

export const DEFAULT_PLANS: Record<UserLevel, PlanDetails> = {
  [UserLevel.APPRENTICE]: {
    name: 'Apprentice',
    price: {
      tkn: 0,
      bnb: 0
    },
    features: [
      'Création de token basic',
      'Fonctionnalités limitées'
    ]
  },
  [UserLevel.BASIC]: {
    name: 'Basic',
    price: {
      tkn: 100,
      bnb: 0.1
    },
    features: [
      'Création de token illimitée',
      'Fonctionnalités standard',
      'Support basique'
    ]
  },
  [UserLevel.PREMIUM]: {
    name: 'Premium',
    price: {
      tkn: 1000,
      bnb: 1
    },
    features: [
      'Toutes les fonctionnalités',
      'Support prioritaire',
      'Personnalisation avancée',
      'Accès anticipé aux nouvelles fonctionnalités'
    ]
  }
};
