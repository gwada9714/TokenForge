/**
 * Service pour gérer les produits de TokenForge
 */
class ProductService {
  // Plans d'abonnement
  private subscriptionPlans: Record<string, { monthly: number, annual: number, features: string[] }> = {
    'basic': {
      monthly: 19.99,
      annual: 199.99,
      features: [
        'Réduction de 10% sur la création de tokens',
        'Support par email',
        'Accès aux outils de base'
      ]
    },
    'premium': {
      monthly: 49.99,
      annual: 499.99,
      features: [
        'Réduction de 20% sur la création de tokens',
        'Support prioritaire',
        'Accès à tous les outils',
        'Personnalisation avancée'
      ]
    },
    'enterprise': {
      monthly: 199.99,
      annual: 1999.99,
      features: [
        'Réduction de 30% sur la création de tokens',
        'Support dédié',
        'Accès à toutes les fonctionnalités',
        'Personnalisation complète',
        'API dédiée'
      ]
    }
  };
  
  // Services premium
  private premiumServices: Record<string, { price: number, description: string }> = {
    'audit-security': {
      price: 499,
      description: 'Audit de sécurité complet du smart contract'
    },
    'kyc-integration': {
      price: 299,
      description: 'Intégration KYC pour votre token'
    },
    'marketing-package': {
      price: 399,
      description: 'Package marketing pour le lancement de votre token'
    },
    'custom-features': {
      price: 599,
      description: 'Développement de fonctionnalités personnalisées'
    }
  };
  
  // Articles de la marketplace
  private marketplaceItems: Record<string, { 
    price: number, 
    name: string, 
    description: string, 
    category: string,
    author: string
  }> = {
    'token-template-defi': {
      price: 49.99,
      name: 'Template Token DeFi',
      description: 'Template de token pour projets DeFi avec fonctionnalités avancées',
      category: 'templates',
      author: 'TokenForge'
    },
    'token-template-nft': {
      price: 39.99,
      name: 'Template Token NFT',
      description: 'Template de token pour projets NFT avec fonctionnalités de minting',
      category: 'templates',
      author: 'TokenForge'
    },
    'token-template-dao': {
      price: 59.99,
      name: 'Template Token DAO',
      description: 'Template de token pour projets DAO avec fonctionnalités de gouvernance',
      category: 'templates',
      author: 'TokenForge'
    },
    'token-template-gaming': {
      price: 49.99,
      name: 'Template Token Gaming',
      description: 'Template de token pour projets de jeux avec fonctionnalités de récompenses',
      category: 'templates',
      author: 'TokenForge'
    }
  };
  
  /**
   * Récupère les détails d'un plan d'abonnement
   * @param planId Identifiant du plan
   * @returns Détails du plan
   */
  async getSubscriptionPlan(planId: string): Promise<{ monthly: number, annual: number, features: string[] }> {
    const plan = this.subscriptionPlans[planId.toLowerCase()];
    
    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`);
    }
    
    return plan;
  }
  
  /**
   * Récupère tous les plans d'abonnement
   * @returns Liste des plans d'abonnement
   */
  async getAllSubscriptionPlans(): Promise<Record<string, { monthly: number, annual: number, features: string[] }>> {
    return this.subscriptionPlans;
  }
  
  /**
   * Récupère les détails d'un service premium
   * @param serviceId Identifiant du service
   * @returns Détails du service
   */
  async getPremiumService(serviceId: string): Promise<{ price: number, description: string }> {
    const service = this.premiumServices[serviceId.toLowerCase()];
    
    if (!service) {
      throw new Error(`Premium service not found: ${serviceId}`);
    }
    
    return service;
  }
  
  /**
   * Récupère tous les services premium
   * @returns Liste des services premium
   */
  async getAllPremiumServices(): Promise<Record<string, { price: number, description: string }>> {
    return this.premiumServices;
  }
  
  /**
   * Récupère les détails d'un article de la marketplace
   * @param itemId Identifiant de l'article
   * @returns Détails de l'article
   */
  async getMarketplaceItem(itemId: string): Promise<{ 
    price: number, 
    name: string, 
    description: string, 
    category: string,
    author: string
  }> {
    const item = this.marketplaceItems[itemId.toLowerCase()];
    
    if (!item) {
      throw new Error(`Marketplace item not found: ${itemId}`);
    }
    
    return item;
  }
  
  /**
   * Récupère tous les articles de la marketplace
   * @param category Catégorie (optionnel)
   * @returns Liste des articles
   */
  async getAllMarketplaceItems(category?: string): Promise<Record<string, { 
    price: number, 
    name: string, 
    description: string, 
    category: string,
    author: string
  }>> {
    if (category) {
      // Filtrer par catégorie
      const filteredItems: Record<string, any> = {};
      
      Object.entries(this.marketplaceItems).forEach(([id, item]) => {
        if (item.category === category) {
          filteredItems[id] = item;
        }
      });
      
      return filteredItems;
    }
    
    return this.marketplaceItems;
  }
  
  /**
   * Vérifie si un utilisateur a acheté un produit
   * @param userId Identifiant de l'utilisateur
   * @param productId Identifiant du produit
   * @returns true si l'utilisateur a acheté le produit, false sinon
   */
  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    // Dans une implémentation réelle, on vérifierait dans Firebase
    // Pour la démo, on retourne false
    return false;
  }
  
  /**
   * Enregistre un achat
   * @param userId Identifiant de l'utilisateur
   * @param productId Identifiant du produit
   * @param productType Type de produit
   * @param amount Montant payé
   * @param paymentSessionId Identifiant de la session de paiement
   */
  async recordPurchase(
    userId: string,
    productId: string,
    productType: 'token_creation' | 'subscription' | 'premium_service' | 'marketplace',
    amount: number,
    paymentSessionId: string
  ): Promise<void> {
    // Dans une implémentation réelle, on enregistrerait dans Firebase
    console.log(`Recording purchase for user ${userId}:`, {
      productId,
      productType,
      amount,
      paymentSessionId
    });
  }
}

module.exports = ProductService;
