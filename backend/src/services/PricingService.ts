/**
 * Service pour gérer les tarifs des services de TokenForge
 */
class PricingService {
  // Prix de base pour la création de token par blockchain (en EUR)
  private tokenCreationPrices: Record<string, number> = {
    ethereum: 299,
    binance: 199,
    polygon: 149,
    avalanche: 179,
    solana: 249,
    arbitrum: 199,
  };

  // Réductions par niveau d'abonnement
  private subscriptionDiscounts: Record<string, number> = {
    free: 0, // 0% de réduction
    basic: 0.1, // 10% de réduction
    premium: 0.2, // 20% de réduction
    enterprise: 0.3, // 30% de réduction
  };

  // Plans d'abonnement (prix en EUR)
  private subscriptionPlans: Record<
    string,
    { monthly: number; annual: number; features: string[] }
  > = {
    basic: {
      monthly: 19.99,
      annual: 199.99,
      features: [
        "Réduction de 10% sur la création de tokens",
        "Support par email",
        "Accès aux outils de base",
      ],
    },
    premium: {
      monthly: 49.99,
      annual: 499.99,
      features: [
        "Réduction de 20% sur la création de tokens",
        "Support prioritaire",
        "Accès à tous les outils",
        "Personnalisation avancée",
      ],
    },
    enterprise: {
      monthly: 199.99,
      annual: 1999.99,
      features: [
        "Réduction de 30% sur la création de tokens",
        "Support dédié",
        "Accès à toutes les fonctionnalités",
        "Personnalisation complète",
        "API dédiée",
      ],
    },
  };

  // Services premium (prix en EUR)
  private premiumServices: Record<
    string,
    { price: number; description: string }
  > = {
    "audit-security": {
      price: 499,
      description: "Audit de sécurité complet du smart contract",
    },
    "kyc-integration": {
      price: 299,
      description: "Intégration KYC pour votre token",
    },
    "marketing-package": {
      price: 399,
      description: "Package marketing pour le lancement de votre token",
    },
    "custom-features": {
      price: 599,
      description: "Développement de fonctionnalités personnalisées",
    },
  };

  // Codes promo
  private promoCodes: Record<string, { discount: number; expiresAt: number }> =
    {
      LAUNCH2025: {
        discount: 0.15, // 15% de réduction
        expiresAt: new Date("2025-12-31").getTime(),
      },
      WELCOME10: {
        discount: 0.1, // 10% de réduction
        expiresAt: new Date("2026-12-31").getTime(),
      },
    };

  /**
   * Récupère le prix de création de token pour une blockchain
   * @param network Nom de la blockchain
   * @returns Prix en EUR
   */
  async getTokenCreationPrice(network: string): Promise<number> {
    const price = this.tokenCreationPrices[network.toLowerCase()];

    if (!price) {
      throw new Error(`Unsupported blockchain network: ${network}`);
    }

    return price;
  }

  /**
   * Calcule le prix de création de token avec les réductions applicables
   * @param network Nom de la blockchain
   * @param userId Identifiant de l'utilisateur
   * @returns Prix final en EUR
   */
  async calculateTokenCreationPrice(
    network: string,
    userId: string
  ): Promise<number> {
    // Récupérer le prix de base
    const basePrice = await this.getTokenCreationPrice(network);

    // Dans une implémentation réelle, on récupérerait le niveau d'abonnement de l'utilisateur
    // Pour la démo, on utilise 'free'
    const subscriptionLevel = await this.getUserSubscriptionLevel(userId);

    // Appliquer la réduction
    const discount = this.subscriptionDiscounts[subscriptionLevel] || 0;
    const finalPrice = basePrice * (1 - discount);

    return finalPrice;
  }

  /**
   * Récupère le niveau d'abonnement d'un utilisateur
   * @param userId Identifiant de l'utilisateur
   * @returns Niveau d'abonnement
   */
  async getUserSubscriptionLevel(userId: string): Promise<string> {
    // Dans une implémentation réelle, on récupérerait le niveau d'abonnement depuis Firebase
    // Pour la démo, on retourne 'free'
    return "free";
  }

  /**
   * Récupère les détails d'un plan d'abonnement
   * @param planId Identifiant du plan
   * @returns Détails du plan
   */
  async getSubscriptionPlan(
    planId: string
  ): Promise<{ monthly: number; annual: number; features: string[] }> {
    const plan = this.subscriptionPlans[planId.toLowerCase()];

    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`);
    }

    return plan;
  }

  /**
   * Récupère les détails d'un service premium
   * @param serviceId Identifiant du service
   * @returns Détails du service
   */
  async getPremiumService(
    serviceId: string
  ): Promise<{ price: number; description: string }> {
    const service = this.premiumServices[serviceId.toLowerCase()];

    if (!service) {
      throw new Error(`Premium service not found: ${serviceId}`);
    }

    return service;
  }

  /**
   * Récupère la réduction d'un code promo
   * @param code Code promo
   * @returns Taux de réduction (0-1)
   */
  async getPromoCodeDiscount(code: string): Promise<number> {
    const promoCode = this.promoCodes[code.toUpperCase()];

    if (!promoCode) {
      return 0; // Code non trouvé
    }

    // Vérifier si le code est expiré
    if (promoCode.expiresAt < Date.now()) {
      return 0; // Code expiré
    }

    return promoCode.discount;
  }

  /**
   * Récupère la grille tarifaire complète
   * @returns Grille tarifaire
   */
  async getFullPricing(): Promise<{
    tokenCreation: Record<string, number>;
    subscriptionPlans: Record<
      string,
      { monthly: number; annual: number; features: string[] }
    >;
    premiumServices: Record<string, { price: number; description: string }>;
  }> {
    return {
      tokenCreation: this.tokenCreationPrices,
      subscriptionPlans: this.subscriptionPlans,
      premiumServices: this.premiumServices,
    };
  }
}

module.exports = PricingService;
