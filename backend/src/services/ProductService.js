/**
 * Service pour la gestion des produits
 * Fournit des méthodes pour obtenir les informations sur les produits
 */
class ProductService {
  constructor() {
    // Plans d'abonnement
    this.subscriptionPlans = {
      basic: {
        id: "basic",
        name: "Basic",
        monthly: 29.99,
        annual: 299.9, // 2 mois gratuits
        features: ["Création de token standard", "Support par email"],
      },
      pro: {
        id: "pro",
        name: "Professional",
        monthly: 99.99,
        annual: 999.9, // 2 mois gratuits
        features: [
          "Création de token avancé",
          "Support prioritaire",
          "Audit de sécurité de base",
        ],
      },
      enterprise: {
        id: "enterprise",
        name: "Enterprise",
        monthly: 299.99,
        annual: 2999.9, // 2 mois gratuits
        features: [
          "Tokens illimités",
          "Support dédié",
          "Audit de sécurité complet",
          "Déploiement multi-chaînes",
        ],
      },
    };

    // Services premium
    this.premiumServices = {
      "security-audit": {
        id: "security-audit",
        name: "Audit de sécurité",
        price: 1500,
        description:
          "Audit complet de la sécurité de votre token et de votre smart contract",
      },
      "marketing-package": {
        id: "marketing-package",
        name: "Package marketing",
        price: 2000,
        description:
          "Promotion de votre token sur les réseaux sociaux et les plateformes spécialisées",
      },
      "liquidity-provision": {
        id: "liquidity-provision",
        name: "Fourniture de liquidité",
        price: 5000,
        description:
          "Mise en place de pools de liquidité sur les principales DEX",
      },
    };

    // Articles de la marketplace
    this.marketplaceItems = {
      "erc20-template": {
        id: "erc20-template",
        name: "Template de token ERC20 avancé",
        price: 99.99,
        description:
          "Template de token ERC20 avec fonctionnalités avancées (taxation, anti-whale, etc.)",
      },
      "nft-collection": {
        id: "nft-collection",
        name: "Template de collection NFT",
        price: 149.99,
        description:
          "Template de collection NFT avec fonctionnalités avancées (reveal, whitelist, etc.)",
      },
      "defi-dashboard": {
        id: "defi-dashboard",
        name: "Dashboard DeFi",
        price: 299.99,
        description:
          "Dashboard pour suivre les performances de vos tokens et de vos investissements DeFi",
      },
    };
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

    return this.subscriptionPlans[planId];
  }

  /**
   * Récupère tous les plans d'abonnement
   * @returns {Promise<Array>} Liste des plans d'abonnement
   */
  async getAllSubscriptionPlans() {
    return Object.values(this.subscriptionPlans);
  }

  /**
   * Récupère un service premium
   * @param {string} serviceId Identifiant du service
   * @returns {Promise<Object>} Service premium
   */
  async getPremiumService(serviceId) {
    if (!this.premiumServices[serviceId]) {
      throw new Error(`Premium service ${serviceId} not found`);
    }

    return this.premiumServices[serviceId];
  }

  /**
   * Récupère tous les services premium
   * @returns {Promise<Array>} Liste des services premium
   */
  async getAllPremiumServices() {
    return Object.values(this.premiumServices);
  }

  /**
   * Récupère un article de la marketplace
   * @param {string} itemId Identifiant de l'article
   * @returns {Promise<Object>} Article
   */
  async getMarketplaceItem(itemId) {
    if (!this.marketplaceItems[itemId]) {
      throw new Error(`Marketplace item ${itemId} not found`);
    }

    return this.marketplaceItems[itemId];
  }

  /**
   * Récupère tous les articles de la marketplace
   * @returns {Promise<Array>} Liste des articles
   */
  async getAllMarketplaceItems() {
    return Object.values(this.marketplaceItems);
  }

  /**
   * Récupère les produits recommandés pour un utilisateur
   * @param {string} userId Identifiant de l'utilisateur
   * @returns {Promise<Array>} Liste des produits recommandés
   */
  async getRecommendedProducts(userId) {
    // Dans une implémentation réelle, on utiliserait un algorithme de recommandation
    // basé sur l'historique d'achat de l'utilisateur, ses préférences, etc.
    // Pour la démo, on retourne simplement quelques produits
    return [
      this.premiumServices["security-audit"],
      this.marketplaceItems["erc20-template"],
    ];
  }
}

module.exports = ProductService;
