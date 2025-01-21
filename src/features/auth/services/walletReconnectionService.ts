import { BrowserProvider } from 'ethers';
import { mainnet, polygon } from '@wagmi/core/chains';
import type { WalletClient } from 'viem';
import { tabSyncService } from './tabSyncService';
import { networkRetryService } from './networkRetryService';
import { storageService } from './storageService';
import { notificationService } from './notificationService';

// Définition des réseaux supportés avec les configurations complètes
export const SUPPORTED_NETWORKS = [
  mainnet,
  polygon
] as const;

export const AUTH_ACTIONS = {
  WALLET_CONNECT: 'auth/walletConnect',
  WALLET_DISCONNECT: 'auth/walletDisconnect',
  WALLET_NETWORK_CHANGE: 'auth/walletNetworkChange'
} as const;

export interface BaseWalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

export interface WalletState extends BaseWalletState {
  provider: BrowserProvider | null;
  walletClient: WalletClient | null;
}

export interface WalletCallbacks {
  onConnect: (address: string, chainId: number) => void;
  onDisconnect: () => void;
  onNetworkChange: (chainId: number) => void;
  onProviderChange: (provider: BrowserProvider) => void;
  onWalletStateSync?: (state: BaseWalletState) => void;
  onError?: (error: unknown) => void;
}

export class WalletReconnectionService {
  private static instance: WalletReconnectionService;
  private isReconnecting = false;
  private isConnected = false;
  private address: string | null = null;
  private chainId: number | null = null;
  private walletClient: WalletClient | null = null;
  private provider: BrowserProvider | null = null;
  private callbacks: WalletCallbacks | null = null;
  private cleanupListeners: Array<() => void> = [];
  private timeoutIds: Array<NodeJS.Timeout> = [];
  private tabId: string;

  private constructor() {
    this.tabId = crypto.randomUUID();
    this.setupTabSync();
    this.setupNetworkChangeListener();
  }

  public static getInstance(): WalletReconnectionService {
    if (!WalletReconnectionService.instance) {
      WalletReconnectionService.instance = new WalletReconnectionService();
    }
    return WalletReconnectionService.instance;
  }

  public async startReconnection(): Promise<void> {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    try {
      await this.attemptReconnection();
    } catch (error) {
      throw error;
    } finally {
      this.isReconnecting = false;
    }
  }

  private async attemptReconnection(): Promise<void> {
    try {
      const result = await networkRetryService.retryWithTimeout(
        async () => {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });

          if (accounts && accounts.length > 0) {
            // Créer directement le provider et le client
            const provider = new BrowserProvider(window.ethereum);
            const walletClient = provider as unknown as WalletClient;
            
            const parsedChainId = parseInt(chainId as string, 16);
            
            // Mettre à jour l'état avant d'appeler handleWalletConnection
            this.isConnected = true;
            this.address = accounts[0];
            this.chainId = parsedChainId;
            this.walletClient = walletClient;
            this.provider = provider;

            await this.handleWalletConnection(
              accounts[0],
              parsedChainId,
              walletClient,
              provider
            );

            // Broadcast l'état du wallet aux autres onglets
            tabSyncService.broadcast({
              type: AUTH_ACTIONS.WALLET_CONNECT,
              payload: {
                address: accounts[0],
                chainId: parsedChainId,
                isConnected: true
              },
              timestamp: Date.now(),
              tabId: this.tabId,
              priority: 800
            });

            notificationService.success('Portefeuille reconnecté avec succès', { autoClose: 3000 });
          }
        },
        {
          maxAttempts: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          timeout: 10000
        },
        'Tentative de reconnexion'
      );

      if (!result.success) {
        if (result.error) {
          this.handleError(result.error, 'attemptReconnection');
          throw result.error;
        } else {
          const error = new Error('Échec de la reconnexion après plusieurs tentatives');
          this.handleError(error, 'attemptReconnection');
          throw error;
        }
      }
    } catch (error) {
      this.handleError(error, 'attemptReconnection');
      this.isConnected = false;
      notificationService.error('Échec de la reconnexion', { autoClose: 3000 });
      throw error;
    }
  }

  public disconnect(): void {
    this.isConnected = false;
    this.address = null;
    this.chainId = null;
    this.walletClient = null;
    this.provider = null;

    // Nettoyer tous les listeners
    for (const cleanup of this.cleanupListeners) {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    }
    this.cleanupListeners = [];

    // Nettoyer les timeouts
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
    
    if (this.callbacks?.onDisconnect) {
      this.callbacks.onDisconnect();
    }
  }

  public getWalletState(): WalletState {
    return {
      address: this.address,
      chainId: this.chainId,
      isConnected: this.isConnected,
      provider: this.provider,
      walletClient: this.walletClient
    };
  }

  public setCallbacks(callbacks: WalletCallbacks): void {
    this.callbacks = callbacks;
  }

  private async handleWalletConnection(
    address: string,
    chainId: number,
    walletClient: WalletClient,
    provider: BrowserProvider
  ): Promise<void> {
    // Mise à jour de l'état du wallet
    this.address = address;
    this.chainId = chainId;
    this.walletClient = walletClient;
    this.provider = provider;
    this.isConnected = true;

    if (this.callbacks?.onConnect) {
      await this.callbacks.onConnect(address, chainId);
    }
    
    if (this.callbacks?.onProviderChange) {
      this.callbacks.onProviderChange(provider);
    }
  }

  private setupTabSync(): void {
    // S'abonner aux changements d'état du wallet des autres onglets
    const handleMessage = (message: { type: string; payload?: unknown; timestamp: number; tabId: string; priority?: number }) => {
      if (message.type === AUTH_ACTIONS.WALLET_CONNECT && message.tabId !== this.tabId && message.payload) {
        const payload = message.payload as BaseWalletState;
        const { address, chainId, isConnected } = payload;
        this.handleWalletStateSync({ address, chainId, isConnected });
      }
    };

    const cleanup = tabSyncService.subscribe(handleMessage);
    this.cleanupListeners.push(cleanup);
  }

  private handleWalletStateSync(state: BaseWalletState): void {
    this.isConnected = state.isConnected;
    this.address = state.address;
    this.chainId = state.chainId;

    if (this.callbacks?.onWalletStateSync) {
      this.callbacks.onWalletStateSync(state);
    }
  }

  private setupNetworkChangeListener(): void {
    if (!window.ethereum) return;

    const handleChainChange = async (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      const oldChainId = this.chainId;
      
      try {
        await networkRetryService.retryWithTimeout(
          async () => {
            // Mettre à jour l'état immédiatement
            this.chainId = newChainId;
            
            if (this.callbacks?.onNetworkChange) {
              this.callbacks.onNetworkChange(newChainId);
            }

            await storageService.recordNetworkChange(oldChainId, newChainId);
            
            const isSupported = SUPPORTED_NETWORKS.some(network => network.id === newChainId);
            
            if (!isSupported) {
              notificationService.warning(
                `Le réseau actuel n'est pas supporté par TokenForge.`,
                { autoClose: 5000 }
              );
            } else {
              const networkName = SUPPORTED_NETWORKS.find(network => network.id === newChainId)?.name || 'Réseau inconnu';
              notificationService.info(
                `Réseau changé : ${networkName}`,
                { autoClose: 3000 }
              );
            }

            // Notifier les autres onglets
            tabSyncService.broadcast({
              type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE,
              payload: { chainId: newChainId },
              timestamp: Date.now(),
              tabId: this.tabId,
              priority: 800
            });
          },
          {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 5000,
            timeout: 10000,
            metadata: {
              oldChainId,
              newChainId
            }
          },
          'Validation du changement de réseau'
        );
      } catch (error) {
        this.handleError(error, 'networkChange');
      }
    };

    // Ajouter le listener et stocker la fonction de nettoyage
    window.ethereum.on('chainChanged', handleChainChange);
    this.cleanupListeners.push(() => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChange);
      }
    });
  }

  private handleError(error: unknown, context: string): void {
    console.error(`Error in ${context}:`, error);
    if (this.callbacks?.onError) {
      this.callbacks.onError(error);
    }
  }
}

export const walletReconnectionService = WalletReconnectionService.getInstance();
