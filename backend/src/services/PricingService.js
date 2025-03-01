/**
 * Service pour la gestion des prix et des tarifs
 * Fournit des méthodes pour obtenir les prix des produits et services
 */
class PricingService {
  constructor() {
    // Prix de base pour la création de token par réseau
    this.tokenCreationPrices = {
      ethereum: 500, // EUR
      binance: 300,
      polygon: 200,
      avalanche: 250,
      arbitrum: 350,
      solana: 200
    };
    
    // Plans d'abonnement
    this.subscriptionPlans = {
      basic: {
        monthly: 29.99,
        annual: 299.90, // 2 mois gratuits
        features: ['Création de token standard', 'Support par email']
      },
      pro: {
        monthly: 99.99,
        annual: 999.90, // 2 mois gratuits
        features: ['Création de token avancé', 'Support prioritaire', 'Audit de sécurité de base']
      },
      enterprise: {
        monthly: 299.99,
        annual: 2999.90, // 2 mois gratuits
        features: ['Tokens illimités', 'Support dédié', 'Audit de sécurité complet', 'Déploiement multi-chaînes']
      }
    };
    
    // Services premium
    this.premiumServices = {
      audit: {
        id: 'security-audit',
        name: 'Audit de sécurité',
        price: 1500,
        description: 'Audit complet de la sécurité de votre token et de votre smart contract'
      },
      marketing: {
        id: 'marketing-package',
        name: 'Package marketing',
        price: 2000,
        description: 'Promotion de votre token sur les réseaux sociaux et les plateformes spécialisées'
      },
      liquidity: {
        id: 'liquidity-provision',
        name: 'Fourniture de liquidité',
        price: 5000,
        description: 'Mise en place de pools de liquidité sur les principales DEX'
      }
    };
    
    // Codes promo
    this.promoCodes = {
      'LAUNCH2025': 0.2, // 20% de réduction
      'WELCOME': 0.1, // 10% de réduction
      'EARLYBIRD': 0.15 // 15% de réduction
    };
  }
  
  /**
   * Récupère le prix de création de token pour un réseau donné
   * @param {string} network Nom du réseau blockchain
   * @returns {Promise<number>} Prix en EUR
   */
  async getTokenCreationPrice(network) {
    const networkLower = network.toLowerCase();
    
    if (!this.tokenCreationPrices[networkLower]) {
      throw new Error(`Network ${network} not supported`);
    }
    
    return this.tokenCreationPrices[networkLower];
  }
  
  /**
   * Calcule le prix de création de token pour un utilisateur
   * @param {string} network Nom du réseau blockchain
   * @param {string} userId Identifiant de l'utilisateur
   * @returns {Promise<number>} Prix en EUR
   */
  async calculateTokenCreationPrice(network, userId) {
    // Prix de base
    const basePrice = await this.getTokenCreationPrice(network);
    
    // Dans une implémentation réelle, on vérifierait le type d'abonnement de l'utilisateur
    // et on appliquerait des réductions en conséquence
    // Pour la démo, on simule un utilisateur avec un abonnement pro (20% de réduction)
    const discount = 0.2;
    
    return basePrice * (1 - discount);
  }
  
  /**
   * Récupère un plan d'abonnement
   * @param {string} planId Identifiant du plan
   * @returns {Promise<Object>} Plan d'abonnement
   */
  async getSubscriptionPlan(planId) {
    if (!this.subscriptionPlans[planId]) {
      throw new Error(`Subscription plan ${planId} not found`);
    }
    
    return {
      id: planId,
      ...this.subscriptionPlans[planId]
    };
  }
  
  /**
   * Récupère un service premium
   * @param {string} serviceId Identifiant du service
   * @returns {Promise<Object>} Service premium
   */
  async getPremiumService(serviceId) {
    for (const key in this.premiumServices) {
      if (this.premiumServices[key].id === serviceId) {
        return this.premiumServices[key];
      }
    }
    
    throw new Error(`Premium service ${serviceId} not found`);
  }
  
  /**
   * Récupère un article de la marketplace
   * @param {string} itemId Identifiant de l'article
   * @returns {Promise<Object>} Article
   */
  async getMarketplaceItem(itemId) {
    // Dans une implémentation réelle, on récupérerait l'article depuis une base de données
    // Pour la démo, on simule un article
    return {
      id: itemId,
      name: 'Template de token ERC20 avancé',
      price: 99.99,
      description: 'Template de token ERC20 avec fonctionnalités avancées (taxation, anti-whale, etc.)'
    };
  }
  
  /**
   * Récupère la réduction associée à un code promo
   * @param {string} code Code promo
   * @returns {Promise<number>} Taux de réduction (0-1)
   */
  async getPromoCodeDiscount(code) {
    if (!code) return 0;
    
    const upperCode = code.toUpperCase();
    
    return this.promoCodes[upperCode] || 0;
  }
  
  /**
   * Récupère la grille tarifaire complète
   * @returns {Promise<Object>} Grille tarifaire
   */
  async getFullPricing() {
    return {
      tokenCreation: this.tokenCreationPrices,
      subscriptionPlans: this.subscriptionPlans,
      premiumServices: this.premiumServices
    };
  }
}

module.exports = PricingService;
