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
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';
import { configService } from './configService';

const LOG_CATEGORY = 'WalletReconnectionService';
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
  private retryCount = 0;
  private reconnectionTimeout: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private lastAttempt = 0;
  private readonly tabId = crypto.randomUUID();
  private timeoutHandles = new Map<string, NodeJS.Timeout>();
  private currentChainId: number | null = null;
  private isConnected = false;
  private address: string | null = null;
  private chainId: number | null = null;
  private walletClient: WalletClient | null = null;
  private provider: BrowserProvider | null = null;
  private callbacks: WalletCallbacks | null = null;

  private constructor() {
    this.setupTabSync();
    this.setupNetworkChangeListener();
    this.initSyncListener();
  }

  public static getInstance(): WalletReconnectionService {
    if (!WalletReconnectionService.instance) {
      WalletReconnectionService.instance = new WalletReconnectionService();
    }
    return WalletReconnectionService.instance;
  }

  private handleError(error: Error | unknown, context: string): void {
    const err = error instanceof Error ? error : new Error(String(error));
    logService.error(LOG_CATEGORY, `Error in ${context}:`, err);
    notificationService.error('Une erreur est survenue', {
      description: err.message,
      duration: 5000
    });
  }

  public async startReconnection(): Promise<void> {
    if (this.isReconnecting) return;

    try {
      this.isReconnecting = true;
      await this.attemptReconnection();
    } catch (error) {
      this.handleError(error, 'startReconnection');
    } finally {
      this.isReconnecting = false;
    }
  }

  private async attemptReconnection(): Promise<void> {
    if (!window.ethereum) {
      throw createAuthError(
        AUTH_ERROR_CODES.PROVIDER_ERROR,
        'Ethereum provider not found'
      );
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts && accounts.length > 0) {
        await this.handleWalletConnection(
          accounts[0],
          parseInt(chainId as string, 16),
          await getWalletClient(),
          new BrowserProvider(window.ethereum)
        );
      }
    } catch (error) {
      this.handleError(error, 'attemptReconnection');
      throw error;
    }
  }

  public disconnect(): void {
    this.clearTimeouts();
    this.isConnected = false;
    this.address = null;
    this.chainId = null;
    this.walletClient = null;
    this.provider = null;
    
    if (this.callbacks?.onDisconnect) {
      this.callbacks.onDisconnect();
    }
  }

  private clearTimeouts(): void {
    this.timeoutHandles.forEach((handle) => clearTimeout(handle));
    this.timeoutHandles.clear();
    
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;
    }
  }

  public getWalletState(): WalletState {
    return {
      address: this.address,
      chainId: this.chainId,
      isConnected: this.isConnected
    };
  }

  public hasActiveTimeouts(): boolean {
    return this.timeoutHandles.size > 0 || this.reconnectionTimeout !== null;
  }

  private async handleWalletConnection(
    address: string,
    chainId: number,
    walletClient: WalletClient,
    provider: BrowserProvider
  ): Promise<void> {
    this.address = address;
    this.chainId = chainId;
    this.walletClient = walletClient;
    this.provider = provider;
    this.isConnected = true;

    if (this.callbacks?.onConnect) {
      this.callbacks.onConnect(address, chainId, walletClient, provider);
    }
  }

  private setupTabSync(): void {
    tabSyncService.onWalletStateChange((state: WalletState) => {
      if (state.isConnected !== this.isConnected ||
          state.address !== this.address ||
          state.chainId !== this.chainId) {
        this.syncWalletState(state);
      }
    });
  }

  private syncWalletState(state: WalletState): void {
    this.isConnected = state.isConnected;
    this.address = state.address;
    this.chainId = state.chainId;
  }
}

export const walletReconnectionService = WalletReconnectionService.getInstance();
