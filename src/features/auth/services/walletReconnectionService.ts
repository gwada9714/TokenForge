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
import { networkRetryService } from './networkRetryService';

const LOG_CATEGORY = 'WalletReconnectionService';

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

export class WalletReconnectionService {
  private static instance: WalletReconnectionService;
  private isReconnecting = false;
  private tabId = crypto.randomUUID();
  private timeoutHandles = new Map<string, NodeJS.Timeout>();
  private currentChainId: number | null = null;

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

  private setupTabSync(): void {
    tabSyncService.subscribe((message: unknown) => {
      if (this.isWalletMessage(message)) {
        this.handleWalletMessage(message);
      }
    });
  }

  private setupNetworkChangeListener(): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        const newChainId = parseInt(chainId);
        const oldChainId = this.currentChainId;
        this.currentChainId = newChainId;
        void this.handleNetworkChange(oldChainId, newChainId);
      });
    }
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
      onDisconnect();
      return;
    }

    this.isReconnecting = true;
    try {
      const result = await this.connectWithTimeout(storedState.address);
      if (result) {
        const { walletClient, provider, chainId } = result;
        onConnect(storedState.address, chainId, walletClient, provider);
      } else {
        onDisconnect();
      }
    } catch (error) {
      logService.error(LOG_CATEGORY, 'Reconnection failed', {
        name: 'ReconnectionError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      onDisconnect();
    } finally {
      this.isReconnecting = false;
    }
  }

  private async connectWithTimeout(address: string): Promise<{
    walletClient: WalletClient;
    provider: BrowserProvider;
    chainId: number;
  } | null> {
    const startTime = performance.now();
    let success = false;

    try {
      const result = await networkRetryService.retryWithTimeout(
        async () => {
          const config: Partial<Config> = {
            chains: [mainnet],
          };

          const walletClient = await getWalletClient(config as Config);
          if (!walletClient || !walletClient.account) {
            throw new Error('Failed to get wallet client');
          }

          const provider = new BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const chainId = network.chainId;

          const chainIdNumber = Number(chainId);
          if (!SUPPORTED_NETWORKS.some(n => n.id === chainIdNumber)) {
            throw new Error(`Unsupported network: ${chainIdNumber}`);
          }

          if (walletClient.account.address.toLowerCase() !== address.toLowerCase()) {
            throw new Error('Connected address does not match expected address');
          }

          const latency = await this.measureNetworkLatency();
          if (latency > 0) {
            await storageService.updateNetworkLatency(latency);
          }

          return { walletClient, provider, chainId: chainIdNumber };
        },
        NETWORK_RETRY_CONFIG,
        'connexion wallet'
      );

      if (!result.success || !result.result) {
        const error = result.error || new Error('Unknown connection error');
        logService.error(LOG_CATEGORY, 'Connection failed after retries', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        notificationService.error(
          `Échec de la connexion après ${result.attempts} tentatives`,
          { toastId: `connection-error-${result.attempts}` } satisfies NotificationOptions
        );
        return null;
      }

      success = true;
      return result.result;
    } finally {
      const duration = performance.now() - startTime;
      await storageService.updateReconnectionMetrics(success, duration);
    }
  }

  private async handleNetworkChange(oldChainId: number | null, newChainId: number): Promise<void> {
    try {
      await storageService.recordNetworkChange(oldChainId, newChainId);
      
      const newNetworkName = SUPPORTED_NETWORKS.find(net => net.id === newChainId)?.name || 'Inconnu';
      const oldNetworkName = oldChainId 
        ? SUPPORTED_NETWORKS.find(net => net.id === oldChainId)?.name || 'Inconnu'
        : 'Inconnu';

      notificationService.info(
        `Réseau changé : ${oldNetworkName} → ${newNetworkName}`,
        { toastId: `network-change-${newChainId}` } satisfies NotificationOptions
      );

      const latency = await this.measureNetworkLatency();
      if (latency > 0) {
        await storageService.updateNetworkLatency(latency);
      }
    } catch (error) {
      logService.error(LOG_CATEGORY, 'Error handling network change', {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  private async measureNetworkLatency(): Promise<number> {
    const start = performance.now();
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.getBlockNumber();
      return performance.now() - start;
    } catch (error) {
      logService.warn(LOG_CATEGORY, 'Failed to measure network latency', {
        error: error instanceof Error ? error.message : String(error)
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

      const result = await this.connectWithTimeout(account.address);
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
}

export const walletReconnectionService = WalletReconnectionService.getInstance();
