import { BrowserProvider } from 'ethers';
import { getWalletClient, getAccount } from '@wagmi/core';
import { logService } from './logService';
import { storageService } from './storageService';
import { notificationService } from './notificationService';
import { tabSyncService } from './tabSyncService';
import { type WalletClient } from 'viem';
import { config } from '../config/wagmiConfig';
import { mainnet, sepolia } from '@wagmi/core/chains';
import crypto from 'crypto';

const LOG_CATEGORY = 'WalletReconnectionService';

// Configuration des retries
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 2000; // 2 secondes
const RETRY_DELAY_MAX = 10000; // 10 secondes
const CONNECTION_TIMEOUT = 10000; // 10 secondes
const NETWORK_CHECK_INTERVAL = 1000; // 1 seconde

// Réseaux supportés
const SUPPORTED_NETWORKS = [mainnet, sepolia];

export class WalletReconnectionService {
  private static instance: WalletReconnectionService;
  private reconnectionAttempts: Map<string, number> = new Map();
  private timeoutHandles: Map<string, NodeJS.Timeout> = new Map();
  private accountCheckInterval: NodeJS.Timeout | null = null;
  private isReconnecting: boolean = false;
  private readonly tabId: string;

  private constructor() {
    this.tabId = crypto.randomUUID();
  }

  static getInstance(): WalletReconnectionService {
    if (!WalletReconnectionService.instance) {
      WalletReconnectionService.instance = new WalletReconnectionService();
    }
    return WalletReconnectionService.instance;
  }

  getCurrentTabId(): string {
    return this.tabId;
  }

  async attemptReconnection(
    onConnect: (address: string, chainId: number, walletClient: WalletClient, provider: BrowserProvider) => void,
    onDisconnect: () => void
  ): Promise<void> {
    if (this.isReconnecting) {
      logService.debug(LOG_CATEGORY, 'Reconnection already in progress');
      return;
    }

    const storedState = await storageService.getWalletState();
    if (!storedState?.address) {
      logService.debug(LOG_CATEGORY, 'No stored wallet state found');
      return;
    }

    this.isReconnecting = true;
    const address = storedState.address;

    try {
      await this.attemptConnection(address, onConnect, onDisconnect);
      // Mettre en place les watchers après une connexion réussie
      this.setupWatchers(onConnect, onDisconnect);
    } finally {
      this.isReconnecting = false;
    }
  }

  async attemptConnection(
    address: string,
    onConnect: (address: string, chainId: number, walletClient: WalletClient, provider: BrowserProvider) => void,
    onDisconnect: () => void
  ): Promise<void> {
    if (this.isReconnecting) {
      logService.debug(LOG_CATEGORY, 'Already attempting reconnection');
      return;
    }

    this.isReconnecting = true;
    let attempt = 1;
    let cleanup: (() => void) | null = null;

    try {
      while (attempt <= MAX_RETRIES) {
        try {
          const result = await this.connectWithTimeout(address);
          if (result) {
            const { walletClient, provider, chainId } = result;
            
            // Nettoyer l'ancien watcher si présent
            if (cleanup) {
              cleanup();
            }
            
            // Configurer le nouveau watcher
            cleanup = this.setupWatchers(onConnect, onDisconnect);
            
            onConnect(address, chainId, walletClient, provider);
            return;
          }
        } catch (error) {
          logService.warn(LOG_CATEGORY, `Reconnection attempt ${attempt} failed`, {
            address,
            error: error instanceof Error ? error.message : 'Unknown error'
          });

          if (attempt < MAX_RETRIES) {
            const delay = Math.min(RETRY_DELAY_BASE * Math.pow(2, attempt - 1), RETRY_DELAY_MAX);
            await new Promise(resolve => {
              const timeoutHandle = setTimeout(resolve, delay);
              this.timeoutHandles.set(address, timeoutHandle);
            });
          }
        }
        attempt++;
      }

      notificationService.error('La reconnexion au wallet a échoué après plusieurs tentatives');
      onDisconnect();
    } finally {
      this.isReconnecting = false;
      this.reconnectionAttempts.delete(address);
      this.clearTimeouts(address);
    }
  }

  private async connectWithTimeout(address: string): Promise<{ 
    walletClient: WalletClient;
    provider: BrowserProvider;
    chainId: number;
  } | null> {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('CONNECTION_TIMEOUT'));
        }, CONNECTION_TIMEOUT);
      });

      const connectionPromise = (async () => {
        // Vérifier d'abord si ethereum est disponible
        if (!window.ethereum) {
          throw new Error('WALLET_NOT_AVAILABLE');
        }

        // Vérifier si le wallet est déverrouillé
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
          throw new Error('WALLET_LOCKED');
        }

        const walletClient = await getWalletClient(config);
        if (!walletClient) {
          throw new Error('WALLET_CLIENT_ERROR');
        }

        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // Vérifier si le réseau est supporté
        if (!SUPPORTED_NETWORKS.some(net => net.id === chainId)) {
          throw new Error('UNSUPPORTED_NETWORK');
        }

        return { walletClient, provider, chainId };
      })();

      return await Promise.race([connectionPromise, timeoutPromise]) as {
        walletClient: WalletClient;
        provider: BrowserProvider;
        chainId: number;
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      switch (errorMessage) {
        case 'CONNECTION_TIMEOUT':
          notificationService.warning('La connexion au wallet a expiré, nouvelle tentative...');
          break;
        case 'WALLET_NOT_AVAILABLE':
          notificationService.error('Wallet non détecté. Veuillez installer MetaMask.');
          break;
        case 'WALLET_LOCKED':
          notificationService.warning('Wallet verrouillé. Veuillez le déverrouiller pour continuer.');
          break;
        case 'WALLET_CLIENT_ERROR':
          notificationService.error('Erreur de connexion au wallet. Veuillez réessayer.');
          break;
        case 'UNSUPPORTED_NETWORK':
          const supportedNetworks = SUPPORTED_NETWORKS.map(net => net.name).join(' ou ');
          notificationService.warning(`Réseau non supporté. Veuillez vous connecter à ${supportedNetworks}.`);
          break;
        default:
          notificationService.error('Erreur de connexion au wallet');
      }

      logService.warn(LOG_CATEGORY, 'Connection attempt failed', {
        address,
        errorType: errorMessage,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  private setupWatchers(
    onConnect: (address: string, chainId: number, walletClient: WalletClient, provider: BrowserProvider) => void,
    onDisconnect: () => void
  ): () => void {
    if (this.accountCheckInterval) {
      clearInterval(this.accountCheckInterval);
    }

    // S'abonner aux mises à jour du wallet des autres onglets
    const unsubscribe = tabSyncService.subscribe((message) => {
      if (message.type === 'UPDATE_WALLET_STATE' && message.payload) {
        const { isConnected, address, chainId } = message.payload;
        
        if (!isConnected || !address) {
          onDisconnect();
          return;
        }

        // Vérifier si le réseau est supporté
        if (!SUPPORTED_NETWORKS.some(net => net.id === chainId)) {
          const supportedNetworks = SUPPORTED_NETWORKS.map(net => net.name).join(' ou ');
          notificationService.warning(
            `Réseau non supporté dans un autre onglet. Veuillez vous connecter à ${supportedNetworks}.`
          );
          return;
        }

        // Tenter de reconnecter avec le nouvel état
        this.attemptConnection(address, onConnect, onDisconnect).catch(error => {
          logService.error(LOG_CATEGORY, 'Error reconnecting after tab sync', error);
        });
      }
    });

    // Vérifier périodiquement les changements de compte et de réseau
    this.accountCheckInterval = setInterval(async () => {
      try {
        const account = getAccount(config);
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // Vérifier si le réseau est supporté
        const isNetworkSupported = SUPPORTED_NETWORKS.some(net => net.id === chainId);
        
        if (!isNetworkSupported) {
          const supportedNetworks = SUPPORTED_NETWORKS.map(net => net.name).join(' ou ');
          notificationService.warning(
            `Réseau non supporté. Veuillez vous connecter à ${supportedNetworks}.`
          );
          logService.warn(LOG_CATEGORY, 'Unsupported network detected', {
            currentChainId: chainId,
            supportedNetworks: SUPPORTED_NETWORKS.map(net => ({ id: net.id, name: net.name }))
          });
          return;
        }

        // Gérer les changements d'état du wallet
        if (account.address) {
          const walletClient = await getWalletClient(config);
          if (walletClient) {
            // Vérifier si le réseau a changé
            const state = await storageService.getWalletState();
            const previousNetwork = state?.chainId;
            
            if (previousNetwork && previousNetwork !== chainId) {
              const newNetworkName = SUPPORTED_NETWORKS.find(net => net.id === chainId)?.name || 'Inconnu';
              notificationService.info(`Réseau changé pour ${newNetworkName}`);
              logService.info(LOG_CATEGORY, 'Network changed', {
                previousNetwork,
                newNetwork: chainId,
                newNetworkName
              });
            }

            // Mettre à jour l'état et notifier
            const newState = { 
              address: account.address, 
              chainId,
              isConnected: true,
              isCorrectNetwork: SUPPORTED_NETWORKS.some(net => net.id === chainId),
              walletClient,
              provider
            };
            
            await storageService.saveWalletState(newState);
            
            // Synchroniser l'état avec les autres onglets
            tabSyncService.syncWalletState({
              isConnected: true,
              address: account.address,
              chainId
            });
            
            onConnect(account.address, chainId, walletClient, provider);
          }
        } else {
          notificationService.warning('Wallet déconnecté');
          
          // Synchroniser la déconnexion avec les autres onglets
          tabSyncService.syncWalletState({
            isConnected: false,
            address: null,
            chainId: null
          });
          
          onDisconnect();
        }
      } catch (error) {
        logService.error(
          LOG_CATEGORY,
          'Error checking wallet state',
          error instanceof Error ? error : new Error('Unknown error')
        );
      }
    }, NETWORK_CHECK_INTERVAL);

    // Nettoyer l'abonnement lors du nettoyage
    return () => {
      if (this.accountCheckInterval) {
        clearInterval(this.accountCheckInterval);
        this.accountCheckInterval = null;
      }
      unsubscribe();
    };
  }

  private clearTimeouts(address: string): void {
    const handle = this.timeoutHandles.get(address);
    if (handle) {
      clearTimeout(handle);
      this.timeoutHandles.delete(address);
    }
  }

  cleanup(): void {
    if (this.accountCheckInterval) {
      clearInterval(this.accountCheckInterval);
      this.accountCheckInterval = null;
    }
    this.clearTimeouts('*');
    this.reconnectionAttempts.clear();
    this.isReconnecting = false;
  }
}

export const walletReconnectionService = WalletReconnectionService.getInstance();
