import { TokenForgeUser, WalletState } from '../types';

const STORAGE_KEYS = {
  AUTH: 'tokenforge_auth',
  WALLET: 'tokenforge_wallet',
} as const;

interface StoredAuthState {
  user: Pick<TokenForgeUser, 'uid' | 'email' | 'emailVerified' | 'isAdmin' | 'customMetadata'> | null;
  lastLogin: number;
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
