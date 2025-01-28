import { createWalletClient, custom, WalletClient } from 'viem';
import { mainnet, polygon } from '@wagmi/core/chains';
import { tabSyncService } from './tabSyncService';
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
  walletClient: WalletClient | null;
}

export interface WalletCallbacks {
  onConnect: (address: string, chainId: number) => void;
  onDisconnect: () => void;
  onNetworkChange: (chainId: number) => void;
  onWalletStateSync?: (state: BaseWalletState) => void;
  onError?: (error: unknown) => void;
}

class WalletReconnectionService {
  private static instance: WalletReconnectionService;
  private isReconnecting = false;
  private isConnected = false;
  private address: string | null = null;
  private chainId: number | null = null;
  private walletClient: WalletClient | null = null;
  private callbacks: WalletCallbacks | null = null;
  private cleanupListeners: Array<() => void> = [];
  private tabId: string;

  private constructor() {
    this.tabId = crypto.randomUUID();
    this.setupTabSync();
    this.setupNetworkChangeListener();
  }

  static getInstance(): WalletReconnectionService {
    if (!WalletReconnectionService.instance) {
      WalletReconnectionService.instance = new WalletReconnectionService();
    }
    return WalletReconnectionService.instance;
  }

  async startReconnection(): Promise<void> {
    if (this.isReconnecting || this.isConnected) return;
    
    this.isReconnecting = true;
    try {
      await this.attemptReconnection();
    } catch (error) {
      this.handleError(error, 'startReconnection');
      notificationService.error('Échec de la reconnexion au portefeuille', { 
        autoClose: 3000,
        hideProgressBar: false
      });
    } finally {
      this.isReconnecting = false;
    }
  }

  async attemptReconnection(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('Aucun fournisseur Ethereum trouvé');
    }

    try {
      const walletClient = createWalletClient({
        transport: custom(window.ethereum)
      });

      const [address] = await walletClient.requestAddresses();
      const chainId = await walletClient.getChainId();

      await this.handleWalletConnection(address, chainId, walletClient);
      
      // Vérifier si le réseau est supporté
      const isSupported = SUPPORTED_NETWORKS.some(network => network.id === chainId);
      if (!isSupported) {
        notificationService.warning(
          'Le réseau actuel n\'est pas supporté par TokenForge',
          { 
            autoClose: 5000,
            hideProgressBar: false
          }
        );
      } else {
        notificationService.success('Portefeuille connecté avec succès', { 
          autoClose: 3000,
          hideProgressBar: false
        });
      }

      // Notifier les autres onglets
      tabSyncService.broadcast({
        type: AUTH_ACTIONS.WALLET_CONNECT,
        payload: {
          state: {
            address,
            chainId,
            isConnected: true
          }
        },
        timestamp: Date.now(),
        tabId: this.tabId,
        priority: 800
      });
    } catch (error) {
      this.handleError(error, 'attemptReconnection');
      throw error;
    }
  }

  disconnect(): void {
    this.isConnected = false;
    this.address = null;
    this.chainId = null;
    this.walletClient = null;

    // Nettoyer les listeners
    this.cleanupListeners.forEach(cleanup => cleanup());
    this.cleanupListeners = [];

    this.callbacks?.onDisconnect();
    notificationService.info('Portefeuille déconnecté', { 
      autoClose: 3000,
      hideProgressBar: false
    });
  }

  getWalletState(): WalletState {
    return {
      address: this.address,
      chainId: this.chainId,
      isConnected: this.isConnected,
      walletClient: this.walletClient
    };
  }

  setCallbacks(callbacks: WalletCallbacks): void {
    this.callbacks = callbacks;
  }

  private async handleWalletConnection(
    address: string,
    chainId: number,
    walletClient: WalletClient
  ): Promise<void> {
    this.isConnected = true;
    this.address = address;
    this.chainId = chainId;
    this.walletClient = walletClient;

    this.callbacks?.onConnect(address, chainId);
  }

  private setupTabSync(): void {
    tabSyncService.subscribe((message) => this.handleMessage(message));
  }

  private handleMessage(message: { type: string; payload?: unknown; timestamp: number; tabId: string; priority?: number }): void {
    if (message.tabId === this.tabId) return;

    switch (message.type) {
      case AUTH_ACTIONS.WALLET_CONNECT:
        if (message.payload && typeof message.payload === 'object' && 'state' in message.payload) {
          this.handleWalletStateSync(message.payload.state as BaseWalletState);
        }
        break;
      case AUTH_ACTIONS.WALLET_DISCONNECT:
        this.disconnect();
        break;
      case AUTH_ACTIONS.WALLET_NETWORK_CHANGE:
        if (message.payload && typeof message.payload === 'object' && 'chainId' in message.payload) {
          this.handleChainChange(message.payload.chainId as string);
        }
        break;
    }
  }

  private handleWalletStateSync(state: BaseWalletState): void {
    this.isConnected = state.isConnected;
    this.address = state.address;
    this.chainId = state.chainId;
    this.callbacks?.onWalletStateSync?.(state);
  }

  private setupNetworkChangeListener(): void {
    if (!window.ethereum) return;

    window.ethereum.on('chainChanged', (chainId: string) => {
      this.handleChainChange(chainId);
    });

    this.cleanupListeners.push(() => {
      window.ethereum?.removeListener('chainChanged', this.handleChainChange);
    });
  }

  private handleChainChange(chainId: string): void {
    const numericChainId = parseInt(chainId, 16);
    this.chainId = numericChainId;
    this.callbacks?.onNetworkChange(numericChainId);

    // Vérifier si le nouveau réseau est supporté
    const isSupported = SUPPORTED_NETWORKS.some(network => network.id === numericChainId);
    if (!isSupported) {
      notificationService.warning(
        'Le réseau actuel n\'est pas supporté par TokenForge',
        { 
          autoClose: 5000,
          hideProgressBar: false
        }
      );
    } else {
      const networkName = SUPPORTED_NETWORKS.find(network => network.id === numericChainId)?.name || 'Réseau inconnu';
      notificationService.info(
        `Réseau changé : ${networkName}`,
        { 
          autoClose: 3000,
          hideProgressBar: false
        }
      );
    }

    // Notifier les autres onglets
    tabSyncService.broadcast({
      type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE,
      payload: { chainId: numericChainId },
      timestamp: Date.now(),
      tabId: this.tabId,
      priority: 800
    });
  }

  private handleError(error: unknown, context: string): void {
    console.error(`Error in ${context}:`, error);
    this.callbacks?.onError?.(error);
    
    notificationService.error(
      'Une erreur est survenue lors de la connexion au portefeuille',
      { 
        autoClose: 5000,
        hideProgressBar: false
      }
    );
  }
}

export const walletReconnectionService = WalletReconnectionService.getInstance();
