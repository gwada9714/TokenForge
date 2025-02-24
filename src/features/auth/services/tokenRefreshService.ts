import { User } from 'firebase/auth';
import { logService } from './logService';
import { errorService } from './errorService';
import { AUTH_ERROR_CODES } from '../types';

const LOG_CATEGORY = 'TokenRefreshService';
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes

class TokenRefreshService {
  private static instance: TokenRefreshService;
  private refreshInterval: NodeJS.Timeout | null = null;
  private user: User | null = null;

  private constructor() {}

  static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService();
    }
    return TokenRefreshService.instance;
  }

  startTokenRefresh(user: User): void {
    this.user = user;
    this.stopTokenRefresh(); // Nettoyer l'ancien interval si existant

    this.refreshInterval = setInterval(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        logService.error(LOG_CATEGORY, 'Auto refresh failed', error instanceof Error ? error : new Error('Unknown error'));
      }
    }, TOKEN_REFRESH_INTERVAL);

    logService.info(LOG_CATEGORY, 'Token refresh started', {
      userId: user.uid,
      email: user.email
    });
  }

  stopTokenRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      
      if (this.user) {
        logService.info(LOG_CATEGORY, 'Token refresh stopped', {
          userId: this.user.uid,
          email: this.user.email
        });
      }
    }
    this.user = null;
  }

  async refreshToken(): Promise<string> {
    if (!this.user) {
      const error = new Error('No user found for token refresh');
      error.name = AUTH_ERROR_CODES.NO_USER;
      throw error;
    }

    try {
      const token = await this.user.getIdToken(true);
      logService.debug(LOG_CATEGORY, 'Token refreshed successfully');
      
      // Broadcast token refresh to other tabs
      this.channel?.postMessage({
        type: 'SESSION_REFRESH',
        payload: {
          timestamp: Date.now(),
          tabId: crypto.randomUUID(),
          token
        }
      });
      
      return token;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      logService.error(LOG_CATEGORY, 'Failed to refresh token', err);
      throw errorService.handleError(error);
    }
  }

  isRefreshing(): boolean {
    return this.refreshInterval !== null;
  }

  private channel = new BroadcastChannel('tokenforge-token-refresh');
}

export const tokenRefreshService = TokenRefreshService.getInstance();
