import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { logger } from '../../logger';
import { errorService, ErrorCode, ErrorSeverity } from '../../errors/ErrorService';
import { configService } from '../../config';
import { AuthServiceBase, AuthResponse, AuthServiceOptions } from './AuthServiceBase';

/**
 * Interface pour les informations d'identification Web3
 */
export interface Web3Credentials {
  address: string;
  chainId?: number;
  message?: string;
  signature?: string;
}

/**
 * Service d'authentification Web3 implémentant AuthServiceBase
 */
export class Web3AuthService extends AuthServiceBase {
  private static instance: Web3AuthService;
  private provider: ethers.providers.Web3Provider | null = null;
  private currentUser: Web3Credentials | null = null;
  private nonceCache: Map<string, string> = new Map();
  private tokenCache: Map<string, { token: string; expiresAt: number }> = new Map();

  private constructor(options: AuthServiceOptions = {}) {
    // Fusionner les options avec les valeurs de configuration
    const securityConfig = configService.getSecurityConfig();
    const mergedOptions: AuthServiceOptions = {
      enablePersistence: true,
      tokenRefreshInterval: 55 * 60 * 1000, // 55 minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: securityConfig.session.timeout * 1000,
      requireEmailVerification: false, // Non applicable pour Web3
      ...options
    };
    
    super(mergedOptions);
    this.initProvider();
    
    logger.info({
      category: 'Web3Auth',
      message: 'Service d\'authentification Web3 initialisé'
    });
  }

  /**
   * Obtient l'instance singleton du service d'authentification Web3
   */
  public static getInstance(options: AuthServiceOptions = {}): Web3AuthService {
    if (!Web3AuthService.instance) {
      Web3AuthService.instance = new Web3AuthService(options);
    }
    return Web3AuthService.instance;
  }

  /**
   * Initialise le provider Web3
   */
  private async initProvider(): Promise<void> {
    try {
      if (window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        logger.info({
          category: 'Web3Auth',
          message: 'Provider Web3 initialisé avec succès'
        });
      } else {
        logger.warn({
          category: 'Web3Auth',
          message: 'Provider Web3 non disponible'
        });
      }
    } catch (error) {
      logger.error({
        category: 'Web3Auth',
        message: 'Erreur lors de l\'initialisation du provider Web3',
        error: error instanceof Error ? error : new Error(String(error))
      });
      this.provider = null;
    }
  }

  /**
   * Connecte un utilisateur avec Web3
   */
  public async login(credentials: Web3Credentials): Promise<AuthResponse> {
    try {
      if (!this.provider) {
        await this.initProvider();
        if (!this.provider) {
          return {
            success: false,
            error: new Error('Provider Web3 non disponible. Veuillez installer MetaMask ou un wallet compatible.')
          };
        }
      }

      // Si l'adresse n'est pas fournie, demander la connexion du wallet
      if (!credentials.address) {
        const accounts = await this.provider.send('eth_requestAccounts', []);
        if (!accounts || accounts.length === 0) {
          return {
            success: false,
            error: new Error('Aucun compte connecté')
          };
        }
        credentials.address = accounts[0];
      }

      // Si la signature n'est pas fournie, demander la signature du message
      if (!credentials.signature) {
        const { signature, message } = await this.signMessage(credentials.address);
        credentials.signature = signature;
        credentials.message = message;
      }

      // Vérifier la signature
      const isValid = await this.verifySignature(
        credentials.address,
        credentials.message!,
        credentials.signature
      );

      if (!isValid) {
        return {
          success: false,
          error: new Error('Signature invalide')
        };
      }

      // Vérifier si la chaîne est supportée
      const network = await this.provider.getNetwork();
      const web3Config = configService.getWeb3Config();
      
      if (!web3Config.supportedChains.includes(network.chainId)) {
        return {
          success: false,
          error: new Error(`Chaîne non supportée. Veuillez vous connecter à l'une des chaînes supportées: ${web3Config.supportedChains.join(', ')}`)
        };
      }
      
      // Ajouter l'ID de chaîne aux informations d'identification
      credentials.chainId = network.chainId;

      // Générer un token JWT côté serveur (simulation)
      const token = await this.generateToken(credentials);
      
      // Stocker l'utilisateur actuel
      this.currentUser = credentials;
      
      // Configurer le rafraîchissement du token
      await this.setupTokenRefresh(credentials);
      
      logger.info({
        category: 'Web3Auth',
        message: 'Utilisateur connecté avec succès',
        data: { 
          address: credentials.address,
          chainId: credentials.chainId
        }
      });
      
      return {
        success: true,
        user: this.mapToUser(credentials),
        token
      };
    } catch (error) {
      logger.error({
        category: 'Web3Auth',
        message: 'Échec de connexion Web3',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Déconnecte l'utilisateur actuel
   */
  public async logout(): Promise<void> {
    this.currentUser = null;
    this.clearTokenRefresh();
    
    logger.info({
      category: 'Web3Auth',
      message: 'Utilisateur déconnecté avec succès'
    });
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  public async getCurrentUser(): Promise<any | null> {
    return this.currentUser ? this.mapToUser(this.currentUser) : null;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  public async isAuthenticated(): Promise<boolean> {
    return !!this.currentUser;
  }

  /**
   * Obtient un token d'authentification
   */
  public async getToken(forceRefresh: boolean = false): Promise<string | null> {
    if (!this.currentUser) {
      return null;
    }
    
    const cached = this.tokenCache.get(this.currentUser.address);
    if (cached && !forceRefresh && Date.now() < cached.expiresAt) {
      return cached.token;
    }
    
    try {
      const token = await this.generateToken(this.currentUser);
      return token;
    } catch (error) {
      logger.error({
        category: 'Web3Auth',
        message: 'Échec d\'obtention du token',
        error: error instanceof Error ? error : new Error(String(error))
      });
      return null;
    }
  }

  /**
   * Non implémenté pour Web3
   */
  public async signup(): Promise<AuthResponse> {
    return {
      success: false,
      error: new Error('La méthode signup n\'est pas applicable pour l\'authentification Web3')
    };
  }

  /**
   * Non implémenté pour Web3
   */
  public async resetPassword(): Promise<boolean> {
    throw new Error('La méthode resetPassword n\'est pas applicable pour l\'authentification Web3');
  }

  /**
   * Non implémenté pour Web3
   */
  public async updateUserProfile(): Promise<any> {
    throw new Error('La méthode updateUserProfile n\'est pas applicable pour l\'authentification Web3');
  }

  /**
   * Génère un nonce pour la signature
   */
  private async getNonce(address: string): Promise<string> {
    // Dans une implémentation réelle, cela ferait un appel API
    // Ici, nous simulons un nonce aléatoire
    const nonce = Math.floor(Math.random() * 1000000).toString();
    this.nonceCache.set(address, nonce);
    return nonce;
  }

  /**
   * Signe un message avec le wallet de l'utilisateur
   */
  private async signMessage(address: string): Promise<{ signature: string; message: string }> {
    if (!this.provider) {
      throw new Error('Provider Web3 non disponible');
    }
    
    const signer = this.provider.getSigner();
    
    // Création du message SIWE
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum to TokenForge',
      uri: window.location.origin,
      version: '1',
      chainId: (await this.provider.getNetwork()).chainId,
      nonce: await this.getNonce(address)
    });
    
    const messageToSign = message.prepareMessage();
    const signature = await signer.signMessage(messageToSign);
    
    return { signature, message: messageToSign };
  }

  /**
   * Vérifie la signature d'un message
   */
  private async verifySignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error({
        category: 'Web3Auth',
        message: 'Erreur lors de la vérification de la signature',
        error: error instanceof Error ? error : new Error(String(error))
      });
      return false;
    }
  }

  /**
   * Génère un token JWT (simulation)
   */
  private async generateToken(credentials: Web3Credentials): Promise<string> {
    // Dans une implémentation réelle, cela ferait un appel API
    // Ici, nous simulons un token JWT
    const securityConfig = configService.getSecurityConfig();
    const expiresIn = securityConfig.session.timeout; // Utiliser la même durée que pour les autres sessions
    const expiresAt = Date.now() + expiresIn * 1000;
    
    // Simuler un token JWT
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: credentials.address,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt / 1000),
      chainId: credentials.chainId
    }));
    const signature = btoa('simulated_signature');
    
    const token = `${header}.${payload}.${signature}`;
    
    // Mettre en cache le token
    this.tokenCache.set(credentials.address, { token, expiresAt });
    
    return token;
  }

  /**
   * Mappe les informations Web3 à un format utilisateur standard
   */
  private mapToUser(credentials: Web3Credentials): any {
    return {
      uid: credentials.address,
      address: credentials.address,
      chainId: credentials.chainId,
      isWeb3: true,
      displayName: `${credentials.address.substring(0, 6)}...${credentials.address.substring(credentials.address.length - 4)}`,
      photoURL: null
    };
  }

  /**
   * Configure le rafraîchissement automatique du token
   */
  protected async setupTokenRefresh(credentials: Web3Credentials): Promise<void> {
    // Pas besoin d'implémenter le rafraîchissement pour Web3
    // Les tokens sont générés à la demande
  }

  /**
   * Annule le rafraîchissement du token
   */
  protected clearTokenRefresh(): void {
    // Pas besoin d'implémenter pour Web3
  }
}

// Exporter l'instance singleton
export const web3AuthService = Web3AuthService.getInstance();
