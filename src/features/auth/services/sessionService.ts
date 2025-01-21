import { auth } from '../../../config/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthPersistence } from '../store/authPersistence';
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';
import { notificationService } from './notificationService';
import { tabSyncService } from './tabSyncService';
import { randomUUID } from 'crypto';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

interface SessionInfo {
  expiresAt: number;
  lastActivity: number;
  refreshToken: string | null;
  tabId?: string;
  lastSync?: number;
}

interface TokenForgeUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  lastLoginTime?: number;
  provider?: string;
}

interface SyncMessage {
  type: string;
  timestamp: number;
  tabId: string;
  payload?: any;
  priority?: number;
}

interface SessionData {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  metadata: any;
}

export class SessionService {
  private static instance: SessionService;
  private persistence: AuthPersistence;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private activeTimeouts: Set<NodeJS.Timeout> = new Set();
  private currentUser: TokenForgeUser | null = null;
  private tabId: string;
  private lastSync: number = 0;

  private constructor() {
    this.persistence = AuthPersistence.getInstance();
    this.tabId = randomUUID();
    this.initTabSync();
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  private initTabSync() {
    tabSyncService.subscribe((message: SyncMessage) => {
      if (message.type === 'session' && message.tabId !== this.tabId) {
        void this.handleTabSync(message);
      }
    });
  }

  private async handleTabSync(message: SyncMessage) {
    if (message.timestamp > this.lastSync) {
      this.lastSync = message.timestamp;
      await this.refreshSession();
      notificationService.info('Session synchronized across tabs');
    }
  }

  async initSession(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw createAuthError(
          AUTH_ERROR_CODES.NO_USER,
          'No user found'
        );
      }

      const state = await this.persistence.load();
      const sessionInfo: SessionInfo = {
        expiresAt: Date.now() + SESSION_TIMEOUT,
        lastActivity: Date.now(),
        refreshToken: await currentUser.getIdToken(),
        tabId: this.tabId,
        lastSync: Date.now()
      };

      // Récupérer les données stockées précédemment pour préserver isAdmin et customMetadata
      const storedUser = state.user;
      
      await this.persistence.save({
        ...state,
        sessionInfo,
        lastLogin: Date.now(),
        user: {
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified,
          isAdmin: storedUser?.isAdmin,
          customMetadata: storedUser?.customMetadata,
        }
      });
      this.startSessionMonitoring();
    } catch (error) {
      throw createAuthError(
        AUTH_ERROR_CODES.SESSION_ERROR,
        'Failed to initialize session',
        { originalError: error }
      );
    }
  }

  public startSessionMonitoring(): void {
    if (!this.sessionCheckInterval) {
      this.sessionCheckInterval = setInterval(() => {
        void this.refreshSession();
      }, REFRESH_THRESHOLD);
    }
  }

  public stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  async refreshSession(): Promise<void> {
    try {
      const currentTime = Date.now();
      const state = await this.persistence.load();
      
      if (!state || !state.sessionInfo || currentTime >= state.sessionInfo.expiresAt) {
        await this.endSession();
        return;
      }

      if (currentTime >= state.sessionInfo.expiresAt - REFRESH_THRESHOLD) {
        const newSessionInfo: SessionInfo = {
          ...state.sessionInfo,
          expiresAt: currentTime + SESSION_TIMEOUT,
          lastActivity: currentTime,
          tabId: this.tabId,
          lastSync: Date.now()
        };

        await this.persistence.save({
          ...state,
          sessionInfo: newSessionInfo
        });

        tabSyncService.broadcast({
          type: 'session',
          timestamp: Date.now(),
          tabId: this.tabId,
          payload: { action: 'refresh' }
        });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      notificationService.error('Error refreshing session');
    }
  }

  async updateActivity(): Promise<void> {
    try {
      const state = await this.persistence.load();
      if (state?.sessionInfo) {
        await this.persistence.save({
          ...state,
          sessionInfo: {
            ...state.sessionInfo,
            lastActivity: Date.now(),
          },
        });
      }
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }

  async endSession(): Promise<void> {
    try {
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }

      this.activeTimeouts.forEach(timeout => clearTimeout(timeout));
      this.activeTimeouts.clear();

      await this.persistence.clear();
      await auth.signOut();
      this.clearSession();
    } catch (error) {
      throw createAuthError(
        AUTH_ERROR_CODES.SESSION_ERROR,
        'Failed to end session',
        { originalError: error }
      );
    }
  }

  clearSession(): void {
    try {
      this.persistence.clear();
      this.currentUser = null;
      this.stopSessionMonitoring();
      // Notifier les autres onglets de la déconnexion
      tabSyncService.broadcast({
        type: 'session',
        timestamp: Date.now(),
        tabId: this.tabId,
        payload: { action: 'logout' }
      });
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  isSessionValid(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const state = await this.persistence.load();
        const sessionInfo = state.sessionInfo as SessionInfo;

        if (!sessionInfo) {
          resolve(false);
          return;
        }

        const now = Date.now();
        resolve(sessionInfo.expiresAt > now);
      } catch (error) {
        console.error('Session validation error:', error);
        resolve(false);
      }
    });
  }

  updateSession(user: TokenForgeUser): void {
    this.currentUser = user;
    this.startSessionMonitoring();
    // Synchroniser l'état avec les autres onglets
    tabSyncService.syncAuthState(user);
  }

  getCurrentUser(): TokenForgeUser | null {
    return this.currentUser;
  }

  startActivityMonitoring(): void {
    // Implement activity monitoring logic here
  }

  stopActivityMonitoring(): void {
    // Implement stopping activity monitoring logic here
  }

  startSessionTimeout(onTimeout: () => void): { clear: () => void } {
    const timeoutId = setTimeout(() => {
      this.clearSession();
      onTimeout();
    }, SESSION_TIMEOUT);

    this.activeTimeouts.add(timeoutId);

    return {
      clear: () => {
        clearTimeout(timeoutId);
        this.activeTimeouts.delete(timeoutId);
      }
    };
  }

  initializeSession(callback: (user: FirebaseUser | null) => void): () => void {
    return auth.onAuthStateChanged(callback);
  }

  async getUserSession(uid: string): Promise<SessionData | null> {
    try {
      const sessionData = await this.persistence.getData(`users/${uid}`);
      if (!sessionData) {
        return {
          isAdmin: false,
          canCreateToken: false,
          canUseServices: false,
          metadata: {}
        };
      }
      return sessionData as SessionData;
    } catch (error) {
      throw createAuthError(
        AUTH_ERROR_CODES.SESSION_ERROR,
        'Failed to get user session',
        { userId: uid, error }
      );
    }
  }

  async updateUserSession(uid: string, updates: Partial<SessionData>): Promise<void> {
    try {
      const currentData = await this.getUserSession(uid);
      const updatedData = {
        ...currentData,
        ...updates,
        metadata: {
          ...currentData?.metadata,
          ...updates.metadata
        }
      };
      await this.persistence.setData(`users/${uid}`, updatedData);
      this.notifySessionUpdate(uid, updatedData);
    } catch (error) {
      throw createAuthError(
        AUTH_ERROR_CODES.SESSION_ERROR,
        'Failed to update user session',
        { userId: uid, updates, error }
      );
    }
  }

  private notifySessionUpdate(uid: string, data: SessionData) {
    // Implement notification logic here
  }
}

export const sessionService = SessionService.getInstance();
