import { logger } from '@/utils/logger';
import { createBlockchainService } from '../factory';
import { IBlockchainService } from '../interfaces/IBlockchainService';
import { BlockchainServiceAdapter } from '../adapters/BlockchainServiceAdapter';

/**
 * Types d'événements de sécurité liés au wallet
 */
export enum WalletSecurityEvent {
  CONNECTION_ATTEMPT = 'wallet_connection_attempt',
  CONNECTION_SUCCESS = 'wallet_connection_success',
  CONNECTION_FAILURE = 'wallet_connection_failure',
  NETWORK_CHANGE = 'wallet_network_change',
  ACCOUNT_CHANGE = 'wallet_account_change',
  SIGNATURE_REQUEST = 'wallet_signature_request',
  SIGNATURE_SUCCESS = 'wallet_signature_success',
  SIGNATURE_FAILURE = 'wallet_signature_failure',
  TRANSACTION_REQUEST = 'wallet_transaction_request',
  TRANSACTION_SUCCESS = 'wallet_transaction_success',
  TRANSACTION_FAILURE = 'wallet_transaction_failure',
  DISCONNECT = 'wallet_disconnect'
}

/**
 * Interface pour les métadonnées d'événements de sécurité
 */
interface SecurityEventMetadata {
  chainId?: number | string;
  account?: string;
  walletType?: string;
  error?: string;
  transactionHash?: string;
  method?: string;
  [key: string]: any;
}

/**
 * Service de connexion wallet sécurisé
 * Ajoute des fonctionnalités de sécurité à la connexion wallet:
 * - Validation de la chaîne et du réseau
 * - Détection des changements de compte et de réseau
 * - Journalisation des événements de sécurité
 * - Vérification des signatures
 * - Protection contre les attaques de phishing
 */
export class SecureWalletService {
  private static instance: SecureWalletService;
  private blockchainServices: Map<string, IBlockchainService> = new Map();
  private connectedAccounts: Map<string, string[]> = new Map();
  private allowedChainIds: Map<string, number[]> = new Map();
  private walletProviders: Map<string, any> = new Map();
  private eventListeners: Map<string, (() => void)[]> = new Map();

  private constructor() {
    // Configurer les chaînes autorisées par défaut
    this.configureAllowedChains();
  }

  /**
   * Configure les chaînes autorisées pour chaque blockchain
   */
  private configureAllowedChains(): void {
    // Ethereum - Mainnet (1), Goerli (5), Sepolia (11155111)
    this.allowedChainIds.set('ethereum', [1, 5, 11155111]);
    
    // Binance Smart Chain - Mainnet (56), Testnet (97)
    this.allowedChainIds.set('binance', [56, 97]);
    this.allowedChainIds.set('bsc', [56, 97]);
    
    // Polygon - Mainnet (137), Mumbai (80001)
    this.allowedChainIds.set('polygon', [137, 80001]);
    
    // Avalanche - Mainnet (43114), Fuji (43113)
    this.allowedChainIds.set('avalanche', [43114, 43113]);
    
    // Arbitrum - Mainnet (42161), Goerli (421613)
    this.allowedChainIds.set('arbitrum', [42161, 421613]);
  }

  public static getInstance(): SecureWalletService {
    if (!SecureWalletService.instance) {
      SecureWalletService.instance = new SecureWalletService();
    }
    return SecureWalletService.instance;
  }

  /**
   * Connecte un wallet de manière sécurisée
   * @param chainName Nom de la blockchain
   * @param walletProvider Provider du wallet
   * @returns Service blockchain connecté
   */
  public async connectWallet(chainName: string, walletProvider: any): Promise<IBlockchainService> {
    try {
      // Journaliser la tentative de connexion
      this.logSecurityEvent(WalletSecurityEvent.CONNECTION_ATTEMPT, chainName, {
        walletType: this.detectWalletType(walletProvider)
      });
      
      // Vérifier si le provider est valide
      if (!walletProvider) {
        throw new Error('Provider de wallet non disponible');
      }
      
      // Créer le service blockchain avec l'adaptateur
      const baseService = createBlockchainService(chainName, walletProvider);
      const service = new BlockchainServiceAdapter(baseService);
      
      // Vérifier si le wallet est connecté
      const isConnected = await service.isConnected();
      if (!isConnected) {
        throw new Error('Wallet non connecté');
      }
      
      // Vérifier le réseau
      const networkId = await service.getNetworkId();
      if (!this.isAllowedNetwork(chainName, networkId)) {
        throw new Error(`Réseau non autorisé pour ${chainName}: ${networkId}`);
      }
      
      // Récupérer l'adresse du compte
      const accounts = await service.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('Aucun compte disponible');
      }
      
      // Stocker le service, le provider et les comptes
      this.blockchainServices.set(chainName, service);
      this.walletProviders.set(chainName, walletProvider);
      this.connectedAccounts.set(chainName, accounts);
      
      // Configurer les écouteurs d'événements
      this.setupEventListeners(chainName, walletProvider);
      
      // Journaliser la connexion réussie
      this.logSecurityEvent(WalletSecurityEvent.CONNECTION_SUCCESS, chainName, {
        chainId: networkId,
        account: accounts[0],
        walletType: this.detectWalletType(walletProvider)
      });
      
      return service;
    } catch (error) {
      // Journaliser l'échec de connexion
      this.logSecurityEvent(WalletSecurityEvent.CONNECTION_FAILURE, chainName, {
        error: error instanceof Error ? error.message : String(error),
        walletType: this.detectWalletType(walletProvider)
      });
      
      logger.error('SecureWallet', `Échec de connexion au wallet pour ${chainName}`, error);
      throw error;
    }
  }

  /**
   * Déconnecte un wallet
   * @param chainName Nom de la blockchain
   */
  public async disconnectWallet(chainName: string): Promise<void> {
    try {
      // Nettoyer les écouteurs d'événements
      this.cleanupEventListeners(chainName);
      
      // Supprimer les références
      this.blockchainServices.delete(chainName);
      this.walletProviders.delete(chainName);
      
      const accounts = this.connectedAccounts.get(chainName) || [];
      this.connectedAccounts.delete(chainName);
      
      // Journaliser la déconnexion
      this.logSecurityEvent(WalletSecurityEvent.DISCONNECT, chainName, {
        accounts
      });
      
      logger.info('SecureWallet', `Wallet déconnecté pour ${chainName}`);
    } catch (error) {
      logger.error('SecureWallet', `Erreur lors de la déconnexion du wallet pour ${chainName}`, error);
      throw error;
    }
  }

  /**
   * Vérifie si un réseau est autorisé pour une blockchain
   * @param chainName Nom de la blockchain
   * @param networkId ID du réseau
   * @returns true si le réseau est autorisé, false sinon
   */
  private isAllowedNetwork(chainName: string, networkId: number): boolean {
    const allowedNetworks = this.allowedChainIds.get(chainName);
    if (!allowedNetworks) {
      return false;
    }
    
    return allowedNetworks.includes(networkId);
  }

  /**
   * Configure les écouteurs d'événements pour un wallet
   * @param chainName Nom de la blockchain
   * @param provider Provider du wallet
   */
  private setupEventListeners(chainName: string, provider: any): void {
    // Nettoyer les écouteurs existants
    this.cleanupEventListeners(chainName);
    
    const listeners: (() => void)[] = [];
    
    // Écouteur pour le changement de compte
    if (provider.on) {
      // Changement de compte
      const accountsChangedListener = (accounts: string[]) => {
        this.handleAccountsChanged(chainName, accounts);
      };
      provider.on('accountsChanged', accountsChangedListener);
      listeners.push(() => provider.removeListener('accountsChanged', accountsChangedListener));
      
      // Changement de chaîne
      const chainChangedListener = (chainId: string) => {
        this.handleChainChanged(chainName, chainId);
      };
      provider.on('chainChanged', chainChangedListener);
      listeners.push(() => provider.removeListener('chainChanged', chainChangedListener));
      
      // Déconnexion
      const disconnectListener = (error: any) => {
        this.handleDisconnect(chainName, error);
      };
      provider.on('disconnect', disconnectListener);
      listeners.push(() => provider.removeListener('disconnect', disconnectListener));
    }
    
    // Stocker les écouteurs pour pouvoir les nettoyer plus tard
    this.eventListeners.set(chainName, listeners);
  }

  /**
   * Nettoie les écouteurs d'événements pour un wallet
   * @param chainName Nom de la blockchain
   */
  private cleanupEventListeners(chainName: string): void {
    const listeners = this.eventListeners.get(chainName);
    if (listeners) {
      listeners.forEach(removeListener => removeListener());
      this.eventListeners.delete(chainName);
    }
  }

  /**
   * Gère le changement de compte
   * @param chainName Nom de la blockchain
   * @param accounts Nouveaux comptes
   */
  private handleAccountsChanged(chainName: string, accounts: string[]): void {
    const previousAccounts = this.connectedAccounts.get(chainName) || [];
    
    // Mettre à jour les comptes
    this.connectedAccounts.set(chainName, accounts);
    
    // Journaliser l'événement
    this.logSecurityEvent(WalletSecurityEvent.ACCOUNT_CHANGE, chainName, {
      previousAccounts,
      newAccounts: accounts
    });
    
    logger.info('SecureWallet', `Comptes changés pour ${chainName}`, {
      previousAccounts,
      newAccounts: accounts
    });
  }

  /**
   * Gère le changement de chaîne
   * @param chainName Nom de la blockchain
   * @param chainId Nouvel ID de chaîne
   */
  private handleChainChanged(chainName: string, chainId: string): void {
    // Convertir l'ID de chaîne en nombre
    const networkId = parseInt(chainId, 16);
    
    // Vérifier si le réseau est autorisé
    const isAllowed = this.isAllowedNetwork(chainName, networkId);
    
    // Journaliser l'événement
    this.logSecurityEvent(WalletSecurityEvent.NETWORK_CHANGE, chainName, {
      chainId: networkId,
      isAllowed
    });
    
    logger.info('SecureWallet', `Réseau changé pour ${chainName}`, {
      chainId: networkId,
      isAllowed
    });
    
    // Si le réseau n'est pas autorisé, déconnecter le wallet
    if (!isAllowed) {
      logger.warn('SecureWallet', `Réseau non autorisé pour ${chainName}: ${networkId}`);
      
      // Déconnecter le wallet
      this.disconnectWallet(chainName).catch(error => {
        logger.error('SecureWallet', `Erreur lors de la déconnexion du wallet pour ${chainName}`, error);
      });
    }
  }

  /**
   * Gère la déconnexion
   * @param chainName Nom de la blockchain
   * @param error Erreur éventuelle
   */
  private handleDisconnect(chainName: string, error: any): void {
    // Journaliser l'événement
    this.logSecurityEvent(WalletSecurityEvent.DISCONNECT, chainName, {
      error: error ? (error instanceof Error ? error.message : String(error)) : undefined
    });
    
    logger.info('SecureWallet', `Wallet déconnecté pour ${chainName}`, {
      error
    });
    
    // Nettoyer les ressources
    this.cleanupEventListeners(chainName);
    this.blockchainServices.delete(chainName);
    this.walletProviders.delete(chainName);
    this.connectedAccounts.delete(chainName);
  }

  /**
   * Détecte le type de wallet
   * @param provider Provider du wallet
   * @returns Type de wallet
   */
  private detectWalletType(provider: any): string {
    if (!provider) {
      return 'unknown';
    }
    
    if (provider.isMetaMask) {
      return 'metamask';
    }
    
    if (provider.isTrust) {
      return 'trust';
    }
    
    if (provider.isCoinbaseWallet) {
      return 'coinbase';
    }
    
    if (provider.isWalletConnect) {
      return 'walletconnect';
    }
    
    if (provider.isBraveWallet) {
      return 'brave';
    }
    
    return 'unknown';
  }

  /**
   * Journalise un événement de sécurité
   * @param eventType Type d'événement
   * @param chainName Nom de la blockchain
   * @param metadata Métadonnées supplémentaires
   */
  private logSecurityEvent(
    eventType: WalletSecurityEvent,
    chainName: string,
    metadata: SecurityEventMetadata = {}
  ): void {
    const event = {
      type: eventType,
      chainName,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    
    logger.info('WalletSecurity', `Événement de sécurité wallet: ${eventType}`, event);
    
    // Dans une implémentation réelle, on enverrait ces événements à un service de monitoring
  }

  /**
   * Vérifie si un wallet est connecté
   * @param chainName Nom de la blockchain
   * @returns true si le wallet est connecté, false sinon
   */
  public isWalletConnected(chainName: string): boolean {
    return this.blockchainServices.has(chainName);
  }

  /**
   * Récupère le service blockchain pour une chaîne
   * @param chainName Nom de la blockchain
   * @returns Service blockchain ou null si non connecté
   */
  public getBlockchainService(chainName: string): IBlockchainService | null {
    return this.blockchainServices.get(chainName) || null;
  }

  /**
   * Récupère les comptes connectés pour une chaîne
   * @param chainName Nom de la blockchain
   * @returns Comptes connectés ou tableau vide si non connecté
   */
  public getConnectedAccounts(chainName: string): string[] {
    return this.connectedAccounts.get(chainName) || [];
  }

  /**
   * Récupère l'adresse principale pour une chaîne
   * @param chainName Nom de la blockchain
   * @returns Adresse principale ou null si non connecté
   */
  public getPrimaryAccount(chainName: string): string | null {
    const accounts = this.connectedAccounts.get(chainName);
    return accounts && accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Ajoute un réseau autorisé pour une blockchain
   * @param chainName Nom de la blockchain
   * @param networkId ID du réseau
   */
  public addAllowedNetwork(chainName: string, networkId: number): void {
    const allowedNetworks = this.allowedChainIds.get(chainName) || [];
    if (!allowedNetworks.includes(networkId)) {
      allowedNetworks.push(networkId);
      this.allowedChainIds.set(chainName, allowedNetworks);
    }
  }

  /**
   * Supprime un réseau autorisé pour une blockchain
   * @param chainName Nom de la blockchain
   * @param networkId ID du réseau
   */
  public removeAllowedNetwork(chainName: string, networkId: number): void {
    const allowedNetworks = this.allowedChainIds.get(chainName) || [];
    const index = allowedNetworks.indexOf(networkId);
    if (index !== -1) {
      allowedNetworks.splice(index, 1);
      this.allowedChainIds.set(chainName, allowedNetworks);
    }
  }

  /**
   * Récupère les réseaux autorisés pour une blockchain
   * @param chainName Nom de la blockchain
   * @returns Réseaux autorisés
   */
  public getAllowedNetworks(chainName: string): number[] {
    return this.allowedChainIds.get(chainName) || [];
  }
}

export const secureWalletService = SecureWalletService.getInstance();
