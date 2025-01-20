import { BrowserProvider } from 'ethers';
import { getWalletClient, getAccount } from '@wagmi/core';
import { errorService } from './errorService';
import { notificationService } from './notificationService';
import { storageService } from './storageService';
import { logService } from './logService';
import { type WalletClient } from 'viem';
import { config } from '../config/wagmiConfig';
import { mainnet } from '@wagmi/core/chains';

const LOG_CATEGORY = 'WalletReconnectionService';

// Configuration des retries
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 2000; // 2 secondes
const RETRY_DELAY_MAX = 10000; // 10 secondes
const CONNECTION_TIMEOUT = 10000; // 10 secondes
const NETWORK_CHECK_INTERVAL = 1000; // 1 seconde

// Configuration par défaut
const DEFAULT_CHAIN = mainnet;

// Exponential backoff avec jitter
function getRetryDelay(attempt: number): number {
  const exponentialDelay = Math.min(
    RETRY_DELAY_BASE * Math.pow(2, attempt),
    RETRY_DELAY_MAX
  );
  // Ajouter un jitter aléatoire de ±25%
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(exponentialDelay + jitter);
}

export class WalletReconnectionService {
  private static instance: WalletReconnectionService;
  private reconnectionAttempts: Map<string, number> = new Map();
  private timeoutHandles: Map<string, NodeJS.Timeout> = new Map();
  private accountCheckInterval: NodeJS.Timeout | null = null;
  private isReconnecting: boolean = false;

  private constructor() {}

  static getInstance(): WalletReconnectionService {
    if (!WalletReconnectionService.instance) {
      WalletReconnectionService.instance = new WalletReconnectionService();
    }
    return WalletReconnectionService.instance;
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
    
    if (!storedState?.address || !window.ethereum) {
      return;
    }

    this.isReconnecting = true;
    const address = storedState.address;
    const attempts = this.reconnectionAttempts.get(address) || 0;

    if (attempts >= MAX_RETRIES) {
      notificationService.warn('Impossible de reconnecter le wallet après plusieurs tentatives');
      this.reconnectionAttempts.delete(address);
      this.isReconnecting = false;
      return;
    }

    try {
      logService.info(LOG_CATEGORY, 'Attempting wallet reconnection', {
        address,
        attempt: attempts + 1,
        maxRetries: MAX_RETRIES
      });

      // Définir un timeout pour la tentative de connexion
      const timeoutHandle = setTimeout(() => {
        this.handleConnectionTimeout(address);
      }, CONNECTION_TIMEOUT);
      this.timeoutHandles.set(address, timeoutHandle);

      const walletClient = await getWalletClient(config);
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      const account = getAccount(config);
      if (!account.address || !account.chain) {
        throw new Error('Account or chain not available');
      }

      const provider = new BrowserProvider(window.ethereum);

      // Nettoyer le timeout car la connexion a réussi
      this.clearTimeout(address);
      this.reconnectionAttempts.delete(address);
      this.isReconnecting = false;

      logService.info(LOG_CATEGORY, 'Wallet reconnection successful', {
        address: account.address,
        chainId: account.chain.id
      });

      // Connecter le wallet
      onConnect(account.address, account.chain.id, walletClient, provider);

      // Mettre en place les watchers
      this.setupWatchers(onConnect, onDisconnect);

    } catch (error) {
      this.clearTimeout(address);
      
      const currentAttempts = this.reconnectionAttempts.get(address) || 0;
      this.reconnectionAttempts.set(address, currentAttempts + 1);

      logService.error(
        LOG_CATEGORY,
        'Wallet reconnection attempt failed',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          address,
          attempt: currentAttempts + 1,
          maxRetries: MAX_RETRIES
        }
      );
      
      // Réessayer après un délai exponentiel avec jitter
      const retryDelay = getRetryDelay(currentAttempts);
      setTimeout(() => {
        this.isReconnecting = false;
        this.attemptReconnection(onConnect, onDisconnect);
      }, retryDelay);
    }
  }

  private setupWatchers(
    onConnect: (address: string, chainId: number, walletClient: WalletClient, provider: BrowserProvider) => void,
    onDisconnect: () => void
  ): void {
    // Nettoyer les anciens watchers
    this.clearWatchers();

    // Vérifier périodiquement l'état du compte et du réseau
    this.accountCheckInterval = setInterval(async () => {
      const account = getAccount(config);
      
      if (!account.address) {
        logService.info(LOG_CATEGORY, 'Wallet disconnected', {
          previousChainId: this.getCurrentChainId()
        });
        onDisconnect();
        return;
      }

      if (account.chain) {
        await this.handleNetworkChange(account.chain.id, onConnect, onDisconnect);
      }
    }, NETWORK_CHECK_INTERVAL);

    // Écouter les événements du provider
    if (window.ethereum) {
      window.ethereum.on('chainChanged', async (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        await this.handleNetworkChange(numericChainId, onConnect, onDisconnect);
      });

      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length === 0) {
          logService.info(LOG_CATEGORY, 'Accounts changed - disconnected');
          onDisconnect();
        } else {
          const chainId = this.getCurrentChainId();
          await this.handleNetworkChange(chainId, onConnect, onDisconnect);
        }
      });
    }
  }

  private getCurrentChainId(): number {
    const account = getAccount(config);
    return account.chain?.id || DEFAULT_CHAIN.id;
  }

  private async handleNetworkChange(
    chainId: number,
    onConnect: (address: string, chainId: number, walletClient: WalletClient, provider: BrowserProvider) => void,
    onDisconnect: () => void
  ): Promise<void> {
    try {
      const account = getAccount(config);
      if (!account.address) {
        onDisconnect();
        return;
      }

      const walletClient = await getWalletClient(config);
      if (!walletClient) {
        throw new Error('Wallet client not available after network change');
      }

      const provider = new BrowserProvider(window.ethereum);
      
      logService.info(LOG_CATEGORY, 'Network changed', {
        address: account.address,
        chainId,
        previousChainId: this.getCurrentChainId()
      });

      onConnect(account.address, chainId, walletClient, provider);
    } catch (error) {
      logService.error(
        LOG_CATEGORY,
        'Network change handling failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { chainId }
      );
      errorService.handleError(error);
      onDisconnect();
    }
  }

  private handleConnectionTimeout(address: string): void {
    const currentAttempts = this.reconnectionAttempts.get(address) || 0;
    this.reconnectionAttempts.set(address, currentAttempts + 1);
    
    if (currentAttempts + 1 >= MAX_RETRIES) {
      logService.warn(LOG_CATEGORY, 'Connection timeout after max retries', {
        address,
        attempts: currentAttempts + 1
      });
      notificationService.warn('La connexion au wallet a expiré après plusieurs tentatives');
      this.reconnectionAttempts.delete(address);
    }
    
    this.isReconnecting = false;
  }

  private clearTimeout(address: string): void {
    const handle = this.timeoutHandles.get(address);
    if (handle) {
      clearTimeout(handle);
      this.timeoutHandles.delete(address);
    }
  }

  private clearWatchers(): void {
    if (this.accountCheckInterval) {
      clearInterval(this.accountCheckInterval);
      this.accountCheckInterval = null;
    }

    if (window.ethereum) {
      window.ethereum.removeAllListeners('chainChanged');
      window.ethereum.removeAllListeners('accountsChanged');
    }
  }

  public clearState(): void {
    this.reconnectionAttempts.clear();
    this.timeoutHandles.forEach(handle => clearTimeout(handle));
    this.timeoutHandles.clear();
    this.clearWatchers();
    this.isReconnecting = false;
  }
}

export const walletReconnectionService = WalletReconnectionService.getInstance();
