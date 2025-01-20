import { User } from 'firebase/auth';
import { logService } from './logService';
import { sessionSyncService } from './sessionSyncService';
import { errorService } from './errorService';

const LOG_CATEGORY = 'TokenRefreshService';
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
const TOKEN_EXPIRY_THRESHOLD = 5 * 60 * 1000; // 5 minutes

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
        logService.error(
          LOG_CATEGORY,
          'Token refresh failed',
          error instanceof Error ? error : new Error('Unknown error')
        );
        
        // Si l'erreur est liée à l'expiration de la session, notifier les autres onglets
        if (error instanceof Error && error.message.includes('token expired')) {
          await sessionSyncService.broadcastSessionExpired();
        }
      }
    }, TOKEN_REFRESH_INTERVAL);

    logService.info(LOG_CATEGORY, 'Token refresh started', {
      userId: user.uid,
      email: user.email
    });
  }

  async refreshToken(): Promise<void> {
    if (!this.user) {
      throw errorService.handleError(new Error('No user to refresh token for'));
    }

    try {
      // Vérifier si le token actuel expire bientôt
      const decodedToken = await this.user.getIdTokenResult();
      const expirationTime = new Date(decodedToken.expirationTime).getTime();
      const now = Date.now();

      if (expirationTime - now <= TOKEN_EXPIRY_THRESHOLD) {
        // Forcer le rafraîchissement du token
        await this.user.getIdToken(true);
        logService.info(LOG_CATEGORY, 'Token refreshed', {
          userId: this.user.uid,
          email: this.user.email
        });
      }
    } catch (error) {
      logService.error(
        LOG_CATEGORY,
        'Error refreshing token',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
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

  isRefreshing(): boolean {
    return this.refreshInterval !== null;
  }
}

export const tokenRefreshService = TokenRefreshService.getInstance();
