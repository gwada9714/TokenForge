import { logger } from '@/core/logger';

/**
 * Types de templates
 */
export enum TemplateType {
  TOKEN_STANDARD = 'token_standard',
  TOKEN_DEFI = 'token_defi',
  TOKEN_GAMING = 'token_gaming',
  TOKEN_NFT = 'token_nft',
  TOKEN_GOVERNANCE = 'token_governance',
  TOKEN_SOCIAL = 'token_social',
  TOKEN_CUSTOM = 'token_custom'
}

/**
 * Catégories de templates
 */
export enum TemplateCategory {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  COMMUNITY = 'community'
}

/**
 * Types de licences
 */
export enum LicenseType {
  FREE = 'free',
  SINGLE_USE = 'single_use',
  MULTIPLE_USE = 'multiple_use',
  UNLIMITED = 'unlimited',
  SUBSCRIPTION = 'subscription'
}

/**
 * Interface pour les templates
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: TemplateCategory;
  features: string[];
  previewImage?: string;
  thumbnailImage?: string;
  contractCode: string;
  abi: any[];
  bytecode: string;
  price: number;
  currency: string;
  author: string;
  authorWallet?: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  createdAt: number;
  updatedAt: number;
  license: LicenseType;
  tags: string[];
  blockchain: string[];
  isVerified: boolean;
}

/**
 * Interface pour les options de recherche de templates
 */
export interface TemplateSearchOptions {
  query?: string;
  type?: TemplateType;
  category?: TemplateCategory;
  license?: LicenseType;
  blockchain?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'downloads' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  tags?: string[];
  verifiedOnly?: boolean;
}

/**
 * Interface pour les licences achetées
 */
export interface PurchasedLicense {
  id: string;
  templateId: string;
  userId: string;
  purchaseDate: number;
  expiryDate?: number;
  transactionHash?: string;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
}

/**
 * Service de gestion des templates
 * Gère le marketplace de templates, les licences et les prévisualisations
 */
export class TemplateService {
  private static instance: TemplateService;
  private templates: Map<string, Template> = new Map();
  private purchasedLicenses: Map<string, PurchasedLicense[]> = new Map();

  private constructor() {
    // Initialisation privée pour le singleton
    this.loadSampleTemplates();
  }

  /**
   * Obtient l'instance unique du service (Singleton)
   */
  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * Récupère tous les templates disponibles
   * @param options Options de recherche
   * @returns Liste de templates
   */
  public searchTemplates(options: TemplateSearchOptions = {}): Template[] {
    let templates = Array.from(this.templates.values());
    
    // Filtrer par requête de recherche
    if (options.query) {
      const query = options.query.toLowerCase();
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(query) || 
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filtrer par type
    if (options.type) {
      templates = templates.filter(template => template.type === options.type);
    }
    
    // Filtrer par catégorie
    if (options.category) {
      templates = templates.filter(template => template.category === options.category);
    }
    
    // Filtrer par licence
    if (options.license) {
      templates = templates.filter(template => template.license === options.license);
    }
    
    // Filtrer par blockchain
    if (options.blockchain) {
      templates = templates.filter(template => 
        template.blockchain.includes(options.blockchain!)
      );
    }
    
    // Filtrer par prix
    if (options.minPrice !== undefined) {
      templates = templates.filter(template => template.price >= options.minPrice!);
    }
    
    if (options.maxPrice !== undefined) {
      templates = templates.filter(template => template.price <= options.maxPrice!);
    }
    
    // Filtrer par tags
    if (options.tags && options.tags.length > 0) {
      templates = templates.filter(template => 
        options.tags!.some(tag => template.tags.includes(tag))
      );
    }
    
    // Filtrer par vérification
    if (options.verifiedOnly) {
      templates = templates.filter(template => template.isVerified);
    }
    
    // Trier les résultats
    if (options.sortBy) {
      templates.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'downloads':
            comparison = a.downloads - b.downloads;
            break;
          case 'createdAt':
            comparison = a.createdAt - b.createdAt;
            break;
        }
        
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    
    // Appliquer la pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || templates.length;
      templates = templates.slice(offset, offset + limit);
    }
    
    return templates;
  }

  /**
   * Récupère un template par son ID
   * @param templateId ID du template
   * @returns Template ou null si non trouvé
   */
  public getTemplateById(templateId: string): Template | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Ajoute un nouveau template
   * @param template Template à ajouter
   * @returns ID du template ajouté
   */
  public addTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount' | 'downloads'>): string {
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newTemplate: Template = {
      ...template,
      id: templateId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rating: 0,
      ratingCount: 0,
      downloads: 0
    };
    
    this.templates.set(templateId, newTemplate);
    
    logger.info('TemplateService', `Nouveau template ajouté: ${template.name}`, {
      templateId,
      templateName: template.name,
      templateType: template.type
    });
    
    return templateId;
  }

  /**
   * Met à jour un template existant
   * @param templateId ID du template
   * @param updates Mises à jour à appliquer
   * @returns true si le template a été mis à jour, false sinon
   */
  public updateTemplate(
    templateId: string,
    updates: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>
  ): boolean {
    const template = this.templates.get(templateId);
    
    if (!template) {
      return false;
    }
    
    const updatedTemplate: Template = {
      ...template,
      ...updates,
      updatedAt: Date.now()
    };
    
    this.templates.set(templateId, updatedTemplate);
    
    logger.info('TemplateService', `Template mis à jour: ${template.name}`, {
      templateId,
      templateName: template.name
    });
    
    return true;
  }

  /**
   * Supprime un template
   * @param templateId ID du template
   * @returns true si le template a été supprimé, false sinon
   */
  public deleteTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId);
    
    if (!template) {
      return false;
    }
    
    this.templates.delete(templateId);
    
    logger.info('TemplateService', `Template supprimé: ${template.name}`, {
      templateId,
      templateName: template.name
    });
    
    return true;
  }

  /**
   * Achète une licence pour un template
   * @param templateId ID du template
   * @param userId ID de l'utilisateur
   * @param licenseType Type de licence
   * @param transactionHash Hash de la transaction (optionnel)
   * @returns ID de la licence achetée
   */
  public purchaseLicense(
    templateId: string,
    userId: string,
    licenseType: LicenseType,
    transactionHash?: string
  ): string {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error(`Template non trouvé: ${templateId}`);
    }
    
    // Générer un ID de licence
    const licenseId = `license_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Déterminer les paramètres de la licence selon le type
    let maxUsage: number | undefined;
    let expiryDate: number | undefined;
    
    switch (licenseType) {
      case LicenseType.SINGLE_USE:
        maxUsage = 1;
        break;
      case LicenseType.MULTIPLE_USE:
        maxUsage = 5;
        break;
      case LicenseType.SUBSCRIPTION:
        // Expiration dans 1 an
        expiryDate = Date.now() + 365 * 24 * 60 * 60 * 1000;
        break;
    }
    
    // Créer la licence
    const license: PurchasedLicense = {
      id: licenseId,
      templateId,
      userId,
      purchaseDate: Date.now(),
      expiryDate,
      transactionHash,
      usageCount: 0,
      maxUsage,
      isActive: true
    };
    
    // Stocker la licence
    const userLicenses = this.purchasedLicenses.get(userId) || [];
    userLicenses.push(license);
    this.purchasedLicenses.set(userId, userLicenses);
    
    // Incrémenter le compteur de téléchargements
    template.downloads += 1;
    this.templates.set(templateId, template);
    
    logger.info('TemplateService', `Licence achetée pour le template: ${template.name}`, {
      licenseId,
      templateId,
      userId,
      licenseType
    });
    
    return licenseId;
  }

  /**
   * Vérifie si un utilisateur a une licence valide pour un template
   * @param templateId ID du template
   * @param userId ID de l'utilisateur
   * @returns true si l'utilisateur a une licence valide, false sinon
   */
  public hasValidLicense(templateId: string, userId: string): boolean {
    const userLicenses = this.purchasedLicenses.get(userId) || [];
    
    // Trouver les licences pour ce template
    const templateLicenses = userLicenses.filter(license => 
      license.templateId === templateId && license.isActive
    );
    
    if (templateLicenses.length === 0) {
      return false;
    }
    
    // Vérifier si au moins une licence est valide
    const now = Date.now();
    
    return templateLicenses.some(license => {
      // Vérifier l'expiration
      if (license.expiryDate && license.expiryDate < now) {
        return false;
      }
      
      // Vérifier le nombre d'utilisations
      if (license.maxUsage !== undefined && license.usageCount >= license.maxUsage) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Utilise une licence pour un template
   * @param templateId ID du template
   * @param userId ID de l'utilisateur
   * @returns true si la licence a été utilisée avec succès, false sinon
   */
  public useLicense(templateId: string, userId: string): boolean {
    const userLicenses = this.purchasedLicenses.get(userId) || [];
    
    // Trouver les licences valides pour ce template
    const now = Date.now();
    const validLicenses = userLicenses.filter(license => 
      license.templateId === templateId && 
      license.isActive && 
      (!license.expiryDate || license.expiryDate >= now) &&
      (license.maxUsage === undefined || license.usageCount < license.maxUsage)
    );
    
    if (validLicenses.length === 0) {
      return false;
    }
    
    // Utiliser la première licence valide
    const license = validLicenses[0];
    license.usageCount += 1;
    
    // Mettre à jour les licences de l'utilisateur
    this.purchasedLicenses.set(userId, userLicenses);
    
    logger.info('TemplateService', `Licence utilisée pour le template: ${templateId}`, {
      licenseId: license.id,
      templateId,
      userId,
      usageCount: license.usageCount
    });
    
    return true;
  }

  /**
   * Récupère les licences d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Liste des licences de l'utilisateur
   */
  public getUserLicenses(userId: string): PurchasedLicense[] {
    return this.purchasedLicenses.get(userId) || [];
  }

  /**
   * Évalue un template
   * @param templateId ID du template
   * @param userId ID de l'utilisateur
   * @param rating Note (1-5)
   * @returns true si l'évaluation a été enregistrée, false sinon
   */
  public rateTemplate(templateId: string, userId: string, rating: number): boolean {
    if (rating < 1 || rating > 5) {
      throw new Error('La note doit être comprise entre 1 et 5');
    }
    
    const template = this.templates.get(templateId);
    
    if (!template) {
      return false;
    }
    
    // Calculer la nouvelle note moyenne
    const newRatingCount = template.ratingCount + 1;
    const newRating = ((template.rating * template.ratingCount) + rating) / newRatingCount;
    
    // Mettre à jour le template
    template.rating = newRating;
    template.ratingCount = newRatingCount;
    this.templates.set(templateId, template);
    
    logger.info('TemplateService', `Template évalué: ${template.name}`, {
      templateId,
      userId,
      rating,
      newRating
    });
    
    return true;
  }

  /**
   * Génère une prévisualisation du template
   * @param templateId ID du template
   * @returns Code de prévisualisation ou null si le template n'existe pas
   */
  public generatePreview(templateId: string): string | null {
    const template = this.templates.get(templateId);
    
    if (!template) {
      return null;
    }
    
    // Dans une implémentation réelle, on générerait une prévisualisation du contrat
    // Pour la démo, on retourne simplement un extrait du code
    const previewCode = template.contractCode.substring(0, 500) + '...';
    
    return previewCode;
  }

  // Méthodes privées

  /**
   * Charge des templates d'exemple
   */
  private loadSampleTemplates(): void {
    const sampleTemplates: Template[] = [
      {
        id: 'template_standard_erc20',
        name: 'Standard ERC-20 Token',
        description: 'Un token ERC-20 standard avec les fonctionnalités de base.',
        type: TemplateType.TOKEN_STANDARD,
        category: TemplateCategory.BASIC,
        features: ['Transferable', 'Mintable', 'Burnable'],
        previewImage: '/assets/templates/standard-erc20.png',
        thumbnailImage: '/assets/templates/standard-erc20-thumb.png',
        contractCode: 'contract StandardERC20 {\n  // Code du contrat\n}',
        abi: [],
        bytecode: '0x',
        price: 0,
        currency: 'USD',
        author: 'TokenForge',
        rating: 4.5,
        ratingCount: 120,
        downloads: 1500,
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        license: LicenseType.FREE,
        tags: ['erc20', 'standard', 'basic'],
        blockchain: ['ethereum', 'binance', 'polygon'],
        isVerified: true
      },
      {
        id: 'template_defi_yield',
        name: 'DeFi Yield Token',
        description: 'Un token optimisé pour les applications DeFi avec génération de rendement.',
        type: TemplateType.TOKEN_DEFI,
        category: TemplateCategory.PREMIUM,
        features: ['Yield Generation', 'Auto-Liquidity', 'Anti-Whale', 'Staking'],
        previewImage: '/assets/templates/defi-yield.png',
        thumbnailImage: '/assets/templates/defi-yield-thumb.png',
        contractCode: 'contract DeFiYieldToken {\n  // Code du contrat\n}',
        abi: [],
        bytecode: '0x',
        price: 99.99,
        currency: 'USD',
        author: 'DeFi Experts',
        authorWallet: '0x1234567890abcdef1234567890abcdef12345678',
        rating: 4.8,
        ratingCount: 85,
        downloads: 750,
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        license: LicenseType.SINGLE_USE,
        tags: ['defi', 'yield', 'staking', 'premium'],
        blockchain: ['ethereum', 'binance'],
        isVerified: true
      },
      {
        id: 'template_gaming_token',
        name: 'Gaming Token',
        description: 'Un token conçu pour les jeux blockchain avec fonctionnalités de récompense.',
        type: TemplateType.TOKEN_GAMING,
        category: TemplateCategory.PREMIUM,
        features: ['In-Game Rewards', 'NFT Integration', 'Leaderboard'],
        previewImage: '/assets/templates/gaming-token.png',
        thumbnailImage: '/assets/templates/gaming-token-thumb.png',
        contractCode: 'contract GamingToken {\n  // Code du contrat\n}',
        abi: [],
        bytecode: '0x',
        price: 149.99,
        currency: 'USD',
        author: 'GameDev Studios',
        rating: 4.2,
        ratingCount: 45,
        downloads: 320,
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        license: LicenseType.MULTIPLE_USE,
        tags: ['gaming', 'rewards', 'nft'],
        blockchain: ['ethereum', 'polygon', 'solana'],
        isVerified: true
      },
      {
        id: 'template_governance_dao',
        name: 'Governance DAO Token',
        description: 'Un token de gouvernance pour les organisations autonomes décentralisées.',
        type: TemplateType.TOKEN_GOVERNANCE,
        category: TemplateCategory.ENTERPRISE,
        features: ['Voting', 'Proposal Creation', 'Delegation', 'Timelock'],
        previewImage: '/assets/templates/governance-dao.png',
        thumbnailImage: '/assets/templates/governance-dao-thumb.png',
        contractCode: 'contract GovernanceToken {\n  // Code du contrat\n}',
        abi: [],
        bytecode: '0x',
        price: 299.99,
        currency: 'USD',
        author: 'DAO Architects',
        rating: 4.9,
        ratingCount: 32,
        downloads: 180,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        license: LicenseType.UNLIMITED,
        tags: ['governance', 'dao', 'voting', 'enterprise'],
        blockchain: ['ethereum', 'arbitrum'],
        isVerified: true
      },
      {
        id: 'template_social_token',
        name: 'Social Media Token',
        description: 'Un token pour les créateurs de contenu et les communautés sociales.',
        type: TemplateType.TOKEN_SOCIAL,
        category: TemplateCategory.COMMUNITY,
        features: ['Creator Rewards', 'Community Engagement', 'Content Monetization'],
        previewImage: '/assets/templates/social-token.png',
        thumbnailImage: '/assets/templates/social-token-thumb.png',
        contractCode: 'contract SocialToken {\n  // Code du contrat\n}',
        abi: [],
        bytecode: '0x',
        price: 49.99,
        currency: 'USD',
        author: 'Social Blockchain Labs',
        rating: 4.3,
        ratingCount: 67,
        downloads: 420,
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        license: LicenseType.SUBSCRIPTION,
        tags: ['social', 'creator', 'community'],
        blockchain: ['ethereum', 'polygon', 'solana'],
        isVerified: true
      }
    ];
    
    // Ajouter les templates à la map
    sampleTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
    
    logger.info('TemplateService', `${sampleTemplates.length} templates d'exemple chargés`);
  }
}

// Exporter l'instance unique
export const templateService = TemplateService.getInstance();
