import { TokenForgeUser, WalletState } from '../types';

const STORAGE_KEYS = {
  AUTH: 'tokenforge_auth',
  WALLET: 'tokenforge_wallet',
  METRICS: 'tokenforge_metrics',
} as const;

interface StoredAuthState {
  user: Pick<TokenForgeUser, 'uid' | 'email' | 'emailVerified' | 'isAdmin' | 'customMetadata'> | null;
  lastLogin: number;
}

interface NetworkMetrics {
  lastReconnectionAttempt: number;
  reconnectionAttempts: number;
  successfulReconnections: number;
  failedReconnections: number;
  averageReconnectionTime: number;
  networkLatency: number[];
  lastNetworkChange: number;
  networkChanges: {
    timestamp: number;
    fromChainId: number | null;
    toChainId: number;
  }[];
}

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Auth Storage
  saveAuthState(user: TokenForgeUser | null): void {
    if (user) {
      const authState: StoredAuthState = {
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          isAdmin: user.isAdmin,
          customMetadata: user.customMetadata,
        },
        lastLogin: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authState));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }

  getAuthState(): StoredAuthState | null {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!stored) return null;
    
    try {
      const state = JSON.parse(stored) as StoredAuthState;
      // Vérifier si la session n'a pas expiré (24h)
      if (Date.now() - state.lastLogin > 24 * 60 * 60 * 1000) {
        this.clearAuthState();
        return null;
      }
      return state;
    } catch {
      return null;
    }
  }

  clearAuthState(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  // Wallet Storage
  saveWalletState(state: Partial<WalletState>): void {
    const stored = this.getWalletState() || {};
    const updated = { ...stored, ...state, lastUpdate: Date.now() };
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(updated));
  }

  getWalletState(): (Partial<WalletState> & { lastUpdate?: number }) | null {
    const stored = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (!stored) return null;

    try {
      const state = JSON.parse(stored);
      // Vérifier si l'état n'est pas trop vieux (1h)
      if (state.lastUpdate && Date.now() - state.lastUpdate > 60 * 60 * 1000) {
        this.clearWalletState();
        return null;
      }
      return state;
    } catch {
      return null;
    }
  }

  clearWalletState(): void {
    localStorage.removeItem(STORAGE_KEYS.WALLET);
  }

  // Metrics Storage
  private getDefaultMetrics(): NetworkMetrics {
    return {
      lastReconnectionAttempt: 0,
      reconnectionAttempts: 0,
      successfulReconnections: 0,
      failedReconnections: 0,
      averageReconnectionTime: 0,
      networkLatency: [],
      lastNetworkChange: 0,
      networkChanges: [],
    };
  }

  async saveNetworkMetrics(metrics: Partial<NetworkMetrics>): Promise<void> {
    try {
      const currentMetrics = await this.getNetworkMetrics();
      const updatedMetrics = {
        ...currentMetrics,
        ...metrics,
      };
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(updatedMetrics));
    } catch (error) {
      console.error('Failed to save network metrics:', error);
    }
  }

  async getNetworkMetrics(): Promise<NetworkMetrics> {
    try {
      const storedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
      if (!storedMetrics) {
        return this.getDefaultMetrics();
      }
      return JSON.parse(storedMetrics);
    } catch (error) {
      console.error('Failed to get network metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  async updateReconnectionMetrics(
    success: boolean,
    duration: number
  ): Promise<void> {
    const metrics = await this.getNetworkMetrics();
    const now = Date.now();

    const updatedMetrics: NetworkMetrics = {
      ...metrics,
      lastReconnectionAttempt: now,
      reconnectionAttempts: metrics.reconnectionAttempts + 1,
      successfulReconnections: metrics.successfulReconnections + (success ? 1 : 0),
      failedReconnections: metrics.failedReconnections + (success ? 0 : 1),
      averageReconnectionTime: success
        ? (metrics.averageReconnectionTime * metrics.successfulReconnections + duration) /
          (metrics.successfulReconnections + 1)
        : metrics.averageReconnectionTime,
    };

    await this.saveNetworkMetrics(updatedMetrics);
  }

  async recordNetworkChange(fromChainId: number | null, toChainId: number): Promise<void> {
    const metrics = await this.getNetworkMetrics();
    const now = Date.now();

    const updatedMetrics: NetworkMetrics = {
      ...metrics,
      lastNetworkChange: now,
      networkChanges: [
        ...metrics.networkChanges.slice(-9), // Garder les 9 derniers changements
        {
          timestamp: now,
          fromChainId,
          toChainId,
        },
      ],
    };

    await this.saveNetworkMetrics(updatedMetrics);
  }

  async updateNetworkLatency(latency: number): Promise<void> {
    const metrics = await this.getNetworkMetrics();
    const updatedMetrics: NetworkMetrics = {
      ...metrics,
      networkLatency: [...metrics.networkLatency.slice(-9), latency], // Garder les 10 dernières mesures
    };

    await this.saveNetworkMetrics(updatedMetrics);
  }

  // Clear all storage
  clearAll(): void {
    this.clearAuthState();
    this.clearWalletState();
  }

  async getUserData(uid: string): Promise<{ isAdmin?: boolean; customMetadata?: Record<string, unknown> } | null> {
    const stored = localStorage.getItem(`${STORAGE_KEYS.AUTH}_${uid}`);
    if (!stored) return null;
    
    try {
      const data = JSON.parse(stored);
      return {
        isAdmin: data.user?.isAdmin || false,
        customMetadata: data.user?.customMetadata || {}
      };
    } catch {
      return null;
    }
  }

  async clearUserData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => {
      const pattern = new RegExp(`^${key}`);
      Object.keys(localStorage)
        .filter(k => pattern.test(k))
        .forEach(k => localStorage.removeItem(k));
    });
  }
}

export const storageService = StorageService.getInstance();
