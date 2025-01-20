import { BroadcastChannel } from 'broadcast-channel';
import { logService } from './logService';
import { TokenForgeUser } from '../types';
import { storageService } from './storageService';

const LOG_CATEGORY = 'SessionSyncService';

type SessionEvent = {
  type: 'SESSION_EXPIRED' | 'SESSION_REFRESH' | 'SESSION_LOGOUT' | 'SESSION_UPDATE';
  payload?: {
    user?: TokenForgeUser;
    timestamp?: number;
    tabId?: string;
  };
};

class SessionSyncService {
  private channel: BroadcastChannel<SessionEvent>;
  private tabId: string;
  private listeners: Set<(event: SessionEvent) => void>;
  private lastSyncTimestamp: number;

  constructor() {
    this.channel = new BroadcastChannel('tokenforge-session-sync');
    this.tabId = crypto.randomUUID();
    this.listeners = new Set();
    this.lastSyncTimestamp = Date.now();
    this.initializeChannel();
  }

  private initializeChannel() {
    this.channel.onmessage = (event: SessionEvent) => {
      try {
        this.handleSessionEvent(event);
      } catch (error) {
        logService.error(
          LOG_CATEGORY,
          'Error handling session event',
          error instanceof Error ? error : new Error('Unknown error'),
          { event }
        );
      }
    };
  }

  private async handleSessionEvent(event: SessionEvent) {
    // Ignorer les événements plus anciens
    if (event.payload?.timestamp && event.payload.timestamp < this.lastSyncTimestamp) {
      return;
    }

    // Ignorer les événements de notre propre onglet
    if (event.payload?.tabId === this.tabId) {
      return;
    }

    this.lastSyncTimestamp = event.payload?.timestamp || Date.now();

    // Notifier tous les listeners
    this.listeners.forEach(listener => listener(event));

    // Gérer les événements spécifiques
    switch (event.type) {
      case 'SESSION_EXPIRED':
        await this.handleSessionExpired();
        break;
      case 'SESSION_UPDATE':
        await this.handleSessionUpdate(event.payload?.user);
        break;
      case 'SESSION_LOGOUT':
        await this.handleSessionLogout();
        break;
    }
  }

  private async handleSessionExpired() {
    try {
      await storageService.clearAuthState();
      logService.warn(
        LOG_CATEGORY,
        'Session expired in another tab',
        { tabId: this.tabId }
      );
    } catch (error) {
      logService.error(
        LOG_CATEGORY,
        'Error handling session expiration',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  private async handleSessionUpdate(user?: TokenForgeUser) {
    if (!user) return;

    try {
      await storageService.saveAuthState(user);
      logService.info(
        LOG_CATEGORY,
        'Session updated from another tab',
        { tabId: this.tabId, userEmail: user.email }
      );
    } catch (error) {
      logService.error(
        LOG_CATEGORY,
        'Error handling session update',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  private async handleSessionLogout() {
    try {
      await storageService.clearAuthState();
      logService.info(
        LOG_CATEGORY,
        'Logout triggered from another tab',
        { tabId: this.tabId }
      );
    } catch (error) {
      logService.error(
        LOG_CATEGORY,
        'Error handling session logout',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  public async broadcastSessionExpired() {
    const event: SessionEvent = {
      type: 'SESSION_EXPIRED',
      payload: {
        timestamp: Date.now(),
        tabId: this.tabId
      }
    };
    await this.channel.postMessage(event);
  }

  public async broadcastSessionUpdate(user: TokenForgeUser) {
    const event: SessionEvent = {
      type: 'SESSION_UPDATE',
      payload: {
        user,
        timestamp: Date.now(),
        tabId: this.tabId
      }
    };
    await this.channel.postMessage(event);
  }

  public async broadcastLogout() {
    const event: SessionEvent = {
      type: 'SESSION_LOGOUT',
      payload: {
        timestamp: Date.now(),
        tabId: this.tabId
      }
    };
    await this.channel.postMessage(event);
  }

  public subscribe(listener: (event: SessionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async destroy() {
    this.listeners.clear();
    await this.channel.close();
  }
}

export const sessionSyncService = new SessionSyncService();
