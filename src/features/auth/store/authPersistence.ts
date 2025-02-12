import { createAuthError, AuthErrorCode } from '../errors/AuthError';
import { SessionState } from '../types/session';
import { cryptoService } from '@/utils/crypto';

const STORAGE_KEY = 'tokenforge_auth';
const VERSION = 1;

export interface SessionInfo {
  expiresAt: number;
  lastActivity: number;
  refreshToken: string | null;
  tabId?: string;
  lastSync?: number;
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
  private initialized: boolean = false;

  private constructor() {
    this.storage = window.localStorage;
  }

  static getInstance(): AuthPersistence {
    if (!AuthPersistence.instance) {
      AuthPersistence.instance = new AuthPersistence();
    }
    return AuthPersistence.instance;
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await cryptoService.initialize();
      this.initialized = true;
    }
  }

  async getSessionInfo(): Promise<SessionInfo | null> {
    try {
      await this.initialize();
      const state = await this.load();
      return state.sessionInfo || null;
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.PERSISTENCE_ERROR,
        error instanceof Error ? error.message : 'Erreur lors de la récupération des informations de session'
      );
    }
  }

  async setSessionInfo(sessionInfo: SessionInfo): Promise<void> {
    try {
      await this.initialize();
      const state = await this.load();
      await this.save({
        ...state,
        sessionInfo,
        timestamp: Date.now()
      });
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.PERSISTENCE_ERROR,
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde des informations de session'
      );
    }
  }

  async save(state: Partial<StoredAuthState>): Promise<void> {
    try {
      await this.initialize();
      const currentState = await this.load();
      const newState: StoredAuthState = {
        ...currentState,
        ...state,
        version: VERSION,
        timestamp: Date.now()
      };

      const encryptedData = await cryptoService.encryptData(JSON.stringify(newState));
      this.storage.setItem(STORAGE_KEY, encryptedData);
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.PERSISTENCE_ERROR,
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde de l\'état'
      );
    }
  }

  async load(): Promise<StoredAuthState> {
    try {
      await this.initialize();
      const encryptedData = this.storage.getItem(STORAGE_KEY);
      if (!encryptedData) {
        return this.getInitialState();
      }

      const decryptedData = await cryptoService.decryptData(encryptedData);
      const state = JSON.parse(decryptedData) as StoredAuthState;
      
      if (state.version !== VERSION) {
        return this.migrateState(state);
      }

      return state;
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.PERSISTENCE_ERROR,
        error instanceof Error ? error.message : 'Erreur lors du chargement de l\'état'
      );
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch (error) {
      throw createAuthError(
        AuthErrorCode.PERSISTENCE_ERROR,
        error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'état'
      );
    }
  }

  private getInitialState(): StoredAuthState {
    return {
      version: VERSION,
      timestamp: Date.now(),
      account: null,
      lastProvider: null,
      user: null,
      lastLogin: 0
    };
  }

  private migrateState(oldState: StoredAuthState): StoredAuthState {
    // Implémentation de la migration si nécessaire
    return {
      ...this.getInitialState(),
      ...oldState,
      version: VERSION
    };
  }
}
