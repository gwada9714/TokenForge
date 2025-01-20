import { BrowserProvider } from 'ethers';
import { getWalletClient, getAccount, type GetAccountResult } from '@wagmi/core';
import { errorService } from './errorService';
import { notificationService } from './notificationService';
import { storageService } from './storageService';
import { type WalletClient } from 'viem';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 secondes
const CONNECTION_TIMEOUT = 10000; // 10 secondes

export class WalletReconnectionService {
  private static instance: WalletReconnectionService;
  private reconnectionAttempts: Map<string, number> = new Map();
  private timeoutHandles: Map<string, NodeJS.Timeout> = new Map();
  private accountCheckInterval: NodeJS.Timeout | null = null;

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
    const storedState = await storageService.getWalletState();
    
    if (!storedState?.address || !window.ethereum) {
      return;
    }

    const address = storedState.address;
    const attempts = this.reconnectionAttempts.get(address) || 0;

    if (attempts >= MAX_RETRIES) {
      notificationService.warn('Impossible de reconnecter le wallet après plusieurs tentatives');
      this.reconnectionAttempts.delete(address);
      return;
    }

    try {
      // Définir un timeout pour la tentative de connexion
      const timeoutHandle = setTimeout(() => {
        this.handleConnectionTimeout(address);
      }, CONNECTION_TIMEOUT);
      this.timeoutHandles.set(address, timeoutHandle);

      const walletClient = await getWalletClient({ chainId: storedState.chainId });
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      const account = getAccount({ chainId: storedState.chainId });
      if (!account.address || !account.chain) {
        throw new Error('Account or chain not available');
      }

      const provider = new BrowserProvider(window.ethereum);

      // Nettoyer le timeout car la connexion a réussi
      this.clearTimeout(address);
      this.reconnectionAttempts.delete(address);

      // Connecter le wallet
      onConnect(account.address, account.chain.id, walletClient, provider);

      // Mettre en place les watchers
      this.setupWatchers(onConnect, onDisconnect);

    } catch (error) {
      this.clearTimeout(address);
      
      const currentAttempts = this.reconnectionAttempts.get(address) || 0;
      this.reconnectionAttempts.set(address, currentAttempts + 1);

      console.error('Wallet reconnection attempt failed:', error);
      
      // Réessayer après un délai
      setTimeout(() => {
        this.attemptReconnection(onConnect, onDisconnect);
      }, RETRY_DELAY);
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
      const account = getAccount({ chainId: this.getCurrentChainId() });
      
      if (!account.address) {
        onDisconnect();
        return;
      }

      if (account.chain) {
        await this.handleNetworkChange(account.chain.id, onConnect, onDisconnect);
      }
    }, 1000);
  }

  private getCurrentChainId(): number {
    const account = getAccount({ chainId: 1 }); // Fallback to mainnet
    return account.chain?.id || 1;
  }

  private async handleNetworkChange(
    chainId: number,
    onConnect: (address: string, chainId: number, walletClient: WalletClient, provider: BrowserProvider) => void,
    onDisconnect: () => void
  ): Promise<void> {
    try {
      const account = getAccount({ chainId });
      if (!account.address) {
        onDisconnect();
        return;
      }

      const walletClient = await getWalletClient({ chainId });
      if (!walletClient) {
        throw new Error('Wallet client not available after network change');
      }

      const provider = new BrowserProvider(window.ethereum);
      onConnect(account.address, chainId, walletClient, provider);
    } catch (error) {
      errorService.handleError(error);
      onDisconnect();
    }
  }

  private handleConnectionTimeout(address: string): void {
    const currentAttempts = this.reconnectionAttempts.get(address) || 0;
    this.reconnectionAttempts.set(address, currentAttempts + 1);
    
    if (currentAttempts + 1 >= MAX_RETRIES) {
      notificationService.warn('La connexion au wallet a expiré après plusieurs tentatives');
      this.reconnectionAttempts.delete(address);
    }
  }

  private clearTimeout(address: string): void {
    const timeoutHandle = this.timeoutHandles.get(address);
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      this.timeoutHandles.delete(address);
    }
  }

  private clearWatchers(): void {
    if (this.accountCheckInterval) {
      clearInterval(this.accountCheckInterval);
      this.accountCheckInterval = null;
    }
  }

  clearState(): void {
    this.reconnectionAttempts.clear();
    this.timeoutHandles.forEach(handle => clearTimeout(handle));
    this.timeoutHandles.clear();
    this.clearWatchers();
  }
}

export const walletReconnectionService = WalletReconnectionService.getInstance();
