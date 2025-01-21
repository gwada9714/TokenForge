import { 
  getWalletClient,
  getAccount,
  type Config
} from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';
import { BrowserProvider } from 'ethers';
import { type WalletClient } from 'viem';
import { logService } from './logService';
import { notificationService } from './notificationService';
import type { NotificationOptions } from './notificationService';
import { storageService } from './storageService';
import { tabSyncService } from './tabSyncService';
import { errorService } from './errorService';
import { AUTH_ERROR_CODES } from '../errors/AuthError';

const LOG_CATEGORY = 'WalletReconnectionService';

const EXPECTED_CHAIN_ID = 1; // Ethereum Mainnet, à ajuster selon vos besoins
const MAX_RECONNECTION_ATTEMPTS = 3;
const RECONNECTION_INTERVAL = 5000; // 5 secondes

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

const NETWORK_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  timeout: 10000,
  metadata: {
    service: LOG_CATEGORY,
  },
};

const SUPPORTED_NETWORKS = [
  mainnet,
  // Ajouter d'autres réseaux supportés ici
];

export interface WalletCallbacks {
  onConnect: (address: string, chainId: number, walletClient: WalletClient, provider: BrowserProvider) => void;
  onDisconnect: () => void;
  onNetworkChange: (chainId: number) => void;
  onProviderChange: (provider: BrowserProvider) => void;
}

export class WalletReconnectionService {
  private static instance: WalletReconnectionService;
  private isReconnecting = false;
  private tabId = crypto.randomUUID();
  private timeoutHandles = new Map<string, NodeJS.Timeout>();
  private currentChainId: number | null = null;
  private isConnected = false;
  private address: string | null = null;
  private chainId: number | null = null;
  private walletClient: WalletClient | null = null;
  private provider: BrowserProvider | null = null;
  private callbacks: WalletCallbacks | null = null;
  private reconnectionAttempts = 0;
  private reconnectionTimer?: NodeJS.Timeout;

  private constructor() {
    this.setupTabSync();
    this.setupNetworkChangeListener();
  }

  static getInstance(): WalletReconnectionService {
    if (!WalletReconnectionService.instance) {
      WalletReconnectionService.instance = new WalletReconnectionService();
    }
    return WalletReconnectionService.instance;
  }

  initialize(callbacks: WalletCallbacks): () => void {
    this.callbacks = callbacks;
    
    // Tenter la reconnexion immédiate
    void this.attemptReconnection(3, 1000);

    // Configurer les listeners
    const unsubscribeTab = this.setupTabSync();
    const unsubscribeNetwork = this.setupNetworkChangeListener();
    
    // Retourner une fonction de nettoyage
    return () => {
      this.callbacks = null;
      unsubscribeTab();
      unsubscribeNetwork();
      this.clearTimeouts();
    };
  }

  private setupTabSync(): () => void {
    const handler = (message: unknown) => {
      if (this.isWalletMessage(message)) {
        this.handleWalletMessage(message);
      }
    };
    
    tabSyncService.subscribe(handler);
    return () => {
      tabSyncService.subscribe(handler); // Réutiliser subscribe car c'est aussi unsubscribe
    };
  }

  private setupNetworkChangeListener(): () => void {
    if (!window.ethereum) return () => {};

    const chainChangedHandler = (chainId: string) => {
      const newChainId = parseInt(chainId);
      const oldChainId = this.currentChainId;
      this.currentChainId = newChainId;
      void this.handleNetworkChange(oldChainId, newChainId);
    };

    window.ethereum.on('chainChanged', chainChangedHandler);
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', chainChangedHandler);
      }
    };
  }

  private isWalletMessage(message: unknown): message is { type: string; tabId: string } {
    return typeof message === 'object' && 
           message !== null && 
           'type' in message && 
           'tabId' in message;
  }

  private handleWalletMessage(message: { type: string; tabId: string }): void {
    if (message.type === 'WALLET_STATE_CHANGE' && message.tabId !== this.tabId) {
      // Gérer les changements d'état du wallet depuis d'autres onglets
      this.clearTimeouts();
    }
  }

  private clearTimeouts(): void {
    this.timeoutHandles.forEach(handle => clearTimeout(handle));
    this.timeoutHandles.clear();
  }

  public async attemptReconnection(
    maxAttempts: number,
    baseDelay: number
  ): Promise<void> {
    if (this.isReconnecting) {
      logService.debug(LOG_CATEGORY, 'Reconnection already in progress');
      return;
    }

    const storedState = await storageService.getWalletState();
    if (!storedState?.address) {
      logService.debug(LOG_CATEGORY, 'No stored wallet state found');
      this.callbacks?.onDisconnect();
      return;
    }

    this.isReconnecting = true;
    try {
      const isValid = await this.validateNetworkBeforeConnect();
      if (!isValid) {
        return;
      }

      const result = await this.connectWithTimeout(storedState.address, maxAttempts, baseDelay);
      if (result) {
        const { walletClient, provider, chainId } = result;
        this.callbacks?.onConnect(storedState.address, chainId, walletClient, provider);
      } else {
        this.callbacks?.onDisconnect();
      }
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.error(LOG_CATEGORY, 'Reconnection failed', authError);
      this.callbacks?.onDisconnect();
    } finally {
      this.isReconnecting = false;
    }
  }

  private async connectWithTimeout(
    address: string,
    maxAttempts: number,
    baseDelay: number
  ): Promise<{
    walletClient: WalletClient;
    provider: BrowserProvider;
    chainId: number;
  } | null> {
    const startTime = performance.now();
    let success = false;

    try {
      const result = await this.retryOperation(
        async () => {
          notificationService.info(
            'Tentative de reconnexion au wallet...',
            { toastId: 'wallet-reconnection-attempt' }
          );

          const config: Partial<Config> = {
            chains: [mainnet],
          };

          const walletClient = await getWalletClient(config as Config);
          if (!walletClient || !walletClient.account) {
            throw errorService.createAuthError(
              AUTH_ERROR_CODES.WALLET_NOT_FOUND,
              'Failed to get wallet client'
            );
          }

          const provider = new BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const chainId = network.chainId;

          const chainIdNumber = Number(chainId);
          if (!SUPPORTED_NETWORKS.some(n => n.id === chainIdNumber)) {
            throw errorService.createAuthError(
              AUTH_ERROR_CODES.NETWORK_MISMATCH,
              `Unsupported network: ${chainIdNumber}`
            );
          }

          if (walletClient.account.address.toLowerCase() !== address.toLowerCase()) {
            throw errorService.createAuthError(
              AUTH_ERROR_CODES.INVALID_SIGNATURE,
              'Connected address does not match expected address'
            );
          }

          const latency = await this.measureNetworkLatency();
          if (latency > 0) {
            await storageService.updateNetworkLatency(latency);
          }

          notificationService.success(
            'Reconnexion au wallet réussie',
            { toastId: 'wallet-reconnection-success' }
          );

          this.handleWalletConnection(walletClient.account.address, chainIdNumber, walletClient, provider);

          return { walletClient, provider, chainId: chainIdNumber };
        },
        { maxAttempts, baseDelay }
      );

      if (!result) {
        const error = errorService.createAuthError(
          AUTH_ERROR_CODES.WALLET_DISCONNECTED,
          'Unknown connection error'
        );
        logService.error(LOG_CATEGORY, 'Connection failed after retries', error);
        notificationService.error(
          `Échec de la connexion après ${maxAttempts} tentative${maxAttempts === 1 ? '' : 's'}`,
          { toastId: `connection-error-${maxAttempts}` } satisfies NotificationOptions
        );
        this.handleWalletDisconnection();
        return null;
      }

      success = true;
      return result;
    } finally {
      const duration = performance.now() - startTime;
      await storageService.updateReconnectionMetrics(success, duration);
    }
  }

  private async handleNetworkChange(oldChainId: number | null, newChainId: number): Promise<void> {
    if (!this.callbacks) return;

    try {
      await this.retryOperation(
        async () => {
          this.callbacks?.onNetworkChange(newChainId);
        },
        NETWORK_RETRY_CONFIG
      );
    } catch (err) {
      const authError = errorService.handleError(err);
      logService.error(LOG_CATEGORY, 'Failed to handle network change', authError, {
        context: { oldChainId, newChainId }
      });
      
      const currentNetwork = this.getNetworkName(newChainId);
      notificationService.error(
        `Erreur lors du changement vers ${currentNetwork}`,
        { toastId: `network-change-error-${newChainId}` }
      );
    }
  }

  private getNetworkName(chainId: number): string {
    const network = SUPPORTED_NETWORKS.find(net => net.id === chainId);
    return network?.name || `Réseau ${chainId}`;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    config: { maxAttempts: number; baseDelay: number }
  ): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt === config.maxAttempts) break;
        
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt - 1),
          5000
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  private async measureNetworkLatency(): Promise<number> {
    const start = performance.now();
    try {
      const provider = this.getProvider();
      if (!provider) {
        throw errorService.createAuthError(
          AUTH_ERROR_CODES.PROVIDER_NOT_FOUND,
          'Provider not initialized'
        );
      }
      await provider.getBlockNumber();
      return performance.now() - start;
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.warn(LOG_CATEGORY, 'Failed to measure network latency', {
        error: authError
      });
      return -1;
    }
  }

  async reconnect(): Promise<boolean> {
    if (this.isReconnecting) {
      notificationService.info('Tentative de reconnexion déjà en cours...', {
        toastId: 'reconnect-in-progress'
      } satisfies NotificationOptions);
      return false;
    }

    this.isReconnecting = true;
    
    try {
      const config: Partial<Config> = {
        chains: [mainnet],
      };

      const account = await getAccount(config as Config);
      if (!account.address) {
        notificationService.error('Aucun wallet connecté', {
          toastId: 'no-wallet-connected'
        } satisfies NotificationOptions);
        return false;
      }

      const isValid = await this.validateNetworkBeforeConnect();
      if (!isValid) {
        return false;
      }

      const result = await this.connectWithTimeout(account.address, 3, 1000);
      const success = !!result;
      
      if (success) {
        notificationService.success('Wallet reconnecté avec succès', {
          toastId: 'reconnect-success'
        } satisfies NotificationOptions);
      } else {
        notificationService.error('Échec de la reconnexion du wallet', {
          toastId: 'reconnect-error'
        } satisfies NotificationOptions);
      }

      return success;
    } finally {
      this.isReconnecting = false;
    }
  }

  private async handleWalletConnection(
    address: string,
    chainId: number,
    walletClient: WalletClient,
    provider: BrowserProvider
  ) {
    this.isConnected = true;
    this.address = address;
    this.chainId = chainId;
    this.walletClient = walletClient;
    this.provider = provider;
    
    // Synchroniser l'état avec les autres onglets
    tabSyncService.syncWalletState({
      isConnected: true,
      address,
      chainId
    });

    this.callbacks?.onConnect(address, chainId, walletClient, provider);
    this.callbacks?.onProviderChange(provider);
  }

  private handleWalletDisconnection() {
    this.isConnected = false;
    this.address = null;
    this.chainId = null;
    this.walletClient = null;
    this.provider = null;
    
    // Synchroniser l'état avec les autres onglets
    tabSyncService.syncWalletState({
      isConnected: false,
      address: null,
      chainId: null
    });

    this.callbacks?.onDisconnect();
  }

  getWalletState() {
    return {
      isConnected: this.isConnected,
      address: this.address,
      chainId: this.chainId
    };
  }

  async connect(): Promise<boolean> {
    try {
      const config: Partial<Config> = {
        chains: [mainnet],
      };

      const account = await getAccount(config as Config);
      if (!account.address) {
        notificationService.error('Aucun wallet connecté', {
          toastId: 'no-wallet-connected'
        } satisfies NotificationOptions);
        return false;
      }

      const isValid = await this.validateNetworkBeforeConnect();
      if (!isValid) {
        return false;
      }

      const result = await this.connectWithTimeout(account.address, 3, 1000);
      if (result) {
        const { walletClient, provider, chainId } = result;
        this.handleWalletConnection(account.address, chainId, walletClient, provider);
        return true;
      }

      this.handleWalletDisconnection();
      return false;
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.error(LOG_CATEGORY, 'Erreur lors de la connexion', authError);
      this.handleWalletDisconnection();
      return false;
    }
  }

  disconnect(): void {
    this.handleWalletDisconnection();
  }

  isCorrectNetwork(chainId: number): boolean {
    return chainId === EXPECTED_CHAIN_ID;
  }

  getWalletClient(): WalletClient | null {
    return this.walletClient;
  }

  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  public async validateNetworkBeforeConnect(): Promise<boolean> {
    if (!window.ethereum) {
      throw errorService.createAuthError(
        AUTH_ERROR_CODES.PROVIDER_ERROR,
        'No Ethereum provider found'
      );
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (this.isCorrectNetwork(parseInt(chainId, 16))) {
        return true;
      }

      // Tenter de changer de réseau
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}` }],
      });

      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        throw errorService.createAuthError(
          AUTH_ERROR_CODES.NETWORK_MISMATCH,
          'Network not configured in wallet'
        );
      }
      throw error;
    }
  }

  async reconnectWallet(): Promise<boolean> {
    try {
      if (this.reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
        this.stopReconnectionAttempts();
        throw errorService.createAuthError(
          AUTH_ERROR_CODES.WALLET_DISCONNECTED,
          'Max reconnection attempts reached'
        );
      }

      const isValid = await this.validateNetworkBeforeConnect();
      if (!isValid) {
        return false;
      }

      // Logique de reconnexion du wallet
      const provider = window.ethereum;
      if (!provider) {
        throw errorService.createAuthError(
          AUTH_ERROR_CODES.PROVIDER_ERROR,
          'No Ethereum provider found'
        );
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw errorService.createAuthError(
          AUTH_ERROR_CODES.WALLET_NOT_FOUND,
          'No accounts found'
        );
      }

      this.stopReconnectionAttempts();
      return true;
    } catch (error) {
      this.reconnectionAttempts++;
      throw errorService.handleAuthError(error);
    }
  }

  startReconnectionAttempts(): void {
    if (this.reconnectionTimer) {
      return;
    }

    this.reconnectionTimer = setInterval(() => {
      this.reconnectWallet().catch(() => {
        if (this.reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
          this.stopReconnectionAttempts();
        }
      });
    }, RECONNECTION_INTERVAL);
  }

  stopReconnectionAttempts(): void {
    this.reconnectionAttempts = 0;
    if (this.reconnectionTimer) {
      clearInterval(this.reconnectionTimer);
      this.reconnectionTimer = undefined;
    }
  }
}

export const walletReconnectionService = WalletReconnectionService.getInstance();
