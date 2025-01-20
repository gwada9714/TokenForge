import { createAuthError } from '../errors/AuthError';

const STORAGE_KEY = 'tokenforge_auth';
const VERSION = 1;

export interface SessionInfo {
  expiresAt: number;
  lastActivity: number;
  refreshToken: string | null;
}

export interface StoredAuthState {
  version: number;
  timestamp: number;
  account: string | null;
  lastProvider: string | null;
  trustedDevices?: string[];
  sessionExpiry?: number;
  sessionInfo?: SessionInfo;
  user: {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    isAdmin?: boolean;
    customMetadata?: Record<string, unknown>;
  } | null;
  lastLogin: number;
}

export class AuthPersistence {
  private static instance: AuthPersistence;
  private storage: Storage;

  private constructor() {
    this.storage = window.localStorage;
  }

  static getInstance(): AuthPersistence {
    if (!AuthPersistence.instance) {
      AuthPersistence.instance = new AuthPersistence();
    }
    return AuthPersistence.instance;
  }

  async save(state: Partial<StoredAuthState>): Promise<void> {
    try {
      const currentState = await this.load();
      const newState: StoredAuthState = {
        ...currentState,
        ...state,
        version: VERSION,
        timestamp: Date.now(),
      };

      const encrypted = await this.encrypt(JSON.stringify(newState));
      this.storage.setItem(STORAGE_KEY, encrypted);
    } catch (error) {
      throw createAuthError(
        'AUTH_004',
        'Failed to save auth state',
        { originalError: error }
      );
    }
  }

  async load(): Promise<StoredAuthState> {
    try {
      const encrypted = this.storage.getItem(STORAGE_KEY);
      if (!encrypted) {
        return this.getInitialState();
      }

      const decrypted = await this.decrypt(encrypted);
      const state = JSON.parse(decrypted) as StoredAuthState;

      if (state.version !== VERSION) {
        await this.migrate(state);
      }

      if (this.isExpired(state)) {
        await this.clear();
        throw createAuthError('AUTH_004', 'Session expired');
      }

      return state;
    } catch (error) {
      if (error instanceof Error && error.name === 'AuthError') {
        throw error;
      }
      throw createAuthError(
        'AUTH_004',
        'Failed to load auth state',
        { originalError: error }
      );
    }
  }

  async clear(): Promise<void> {
    this.storage.removeItem(STORAGE_KEY);
  }

  private getInitialState(): StoredAuthState {
    return {
      version: VERSION,
      timestamp: Date.now(),
      account: null,
      lastProvider: null,
      trustedDevices: [],
      user: null,
      lastLogin: 0,
    };
  }

  private async encrypt(data: string): Promise<string> {
    // TODO: Implement actual encryption
    // For now, we'll use base64 encoding as a placeholder
    return btoa(data);
  }

  private async decrypt(encrypted: string): Promise<string> {
    // TODO: Implement actual decryption
    // For now, we'll use base64 decoding as a placeholder
    return atob(encrypted);
  }

  private async migrate(state: StoredAuthState): Promise<void> {
    // TODO: Implement migration logic for future versions
    await this.save({
      ...state,
      version: VERSION,
    });
  }

  private isExpired(state: StoredAuthState): boolean {
    if (!state.sessionExpiry) {
      return false;
    }
    return Date.now() > state.sessionExpiry;
  }
}
