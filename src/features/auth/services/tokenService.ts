import { User } from 'firebase/auth';
import { createAuthError, AuthError } from '../errors/AuthError';
import { notificationService } from './notificationService';
import { retryService, DEFAULT_RETRYABLE_ERRORS } from './retryService';
import { logService } from './logService';

const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes
const TOKEN_EXPIRY_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const LOG_CATEGORY = 'TokenService';

interface TokenInfo {
  token: string;
  expirationTime: number;
}

class TokenService {
  private static instance: TokenService | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private currentUser: User | null = null;
  private tokenInfo: TokenInfo | null = null;

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async initialize(user: User | null): Promise<void> {
    logService.info(LOG_CATEGORY, 'Initializing token service', { userId: user?.uid });
    this.currentUser = user;
    if (user) {
      try {
        await this.refreshToken();
        this.startRefreshTimer();
        logService.info(LOG_CATEGORY, 'Token service initialized successfully', { userId: user.uid });
      } catch (error) {
        logService.error(LOG_CATEGORY, 'Failed to initialize token service', error as Error);
        throw error;
      }
    } else {
      this.stopRefreshTimer();
      this.tokenInfo = null;
      logService.info(LOG_CATEGORY, 'Token service cleaned up due to null user');
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      if (!this.currentUser) {
        const error = createAuthError(
          AuthError.CODES.SESSION_EXPIRED,
          'No user found for token refresh'
        );
        logService.error(LOG_CATEGORY, 'Token refresh failed - no user', error);
        throw error;
      }

      logService.debug(LOG_CATEGORY, 'Starting token refresh', { userId: this.currentUser.uid });

      await retryService.withRetry(
        async () => {
          const tokenPromise = this.currentUser!.getIdToken(true);
          const token = await retryService.withTimeout(
            tokenPromise,
            10000,
            'token refresh'
          );

          const decodedTokenPromise = this.currentUser!.getIdTokenResult();
          const decodedToken = await retryService.withTimeout(
            decodedTokenPromise,
            5000,
            'token decode'
          );

          const expirationTime = new Date(decodedToken.expirationTime).getTime();

          this.tokenInfo = {
            token,
            expirationTime,
          };

          logService.debug(LOG_CATEGORY, 'Token refreshed successfully', {
            userId: this.currentUser!.uid,
            expiresIn: Math.floor((expirationTime - Date.now()) / 1000)
          });

          // Vérifier si le token est proche de l'expiration
          const timeUntilExpiry = expirationTime - Date.now();
          if (timeUntilExpiry < TOKEN_EXPIRY_THRESHOLD) {
            logService.warn(LOG_CATEGORY, 'Token expiration approaching', {
              timeUntilExpiry: Math.floor(timeUntilExpiry / 1000)
            });
            notificationService.warning('Votre session va bientôt expirer');
          }
        },
        {
          maxAttempts: 3,
          initialDelay: 1000,
          maxDelay: 5000
        },
        DEFAULT_RETRYABLE_ERRORS
      );
    } catch (error) {
      logService.error(LOG_CATEGORY, 'Token refresh failed', error as Error);
      notificationService.error('Erreur lors du rafraîchissement du token');
      throw createAuthError(
        AuthError.CODES.SESSION_EXPIRED,
        'Failed to refresh token',
        { error: String(error) }
      );
    }
  }

  private startRefreshTimer(): void {
    logService.debug(LOG_CATEGORY, 'Starting refresh timer');
    this.stopRefreshTimer();
    this.refreshInterval = setInterval(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        logService.error(LOG_CATEGORY, 'Automatic token refresh failed', error as Error);
        this.stopRefreshTimer();
        notificationService.error('Session expirée. Veuillez vous reconnecter.');
      }
    }, TOKEN_REFRESH_INTERVAL);
  }

  private stopRefreshTimer(): void {
    if (this.refreshInterval) {
      logService.debug(LOG_CATEGORY, 'Stopping refresh timer');
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async getToken(): Promise<string> {
    if (!this.tokenInfo) {
      const error = createAuthError(
        AuthError.CODES.SESSION_EXPIRED,
        'No token available'
      );
      logService.error(LOG_CATEGORY, 'Token request failed - no token available', error);
      throw error;
    }

    // Si le token expire bientôt, on le rafraîchit
    const timeUntilExpiry = this.tokenInfo.expirationTime - Date.now();
    if (timeUntilExpiry < TOKEN_EXPIRY_THRESHOLD) {
      logService.info(LOG_CATEGORY, 'Token near expiry, refreshing', {
        timeUntilExpiry: Math.floor(timeUntilExpiry / 1000)
      });
      await this.refreshToken();
    }

    return this.tokenInfo.token;
  }

  isTokenExpired(): boolean {
    const isExpired = !this.tokenInfo || this.tokenInfo.expirationTime <= Date.now();
    if (isExpired) {
      logService.warn(LOG_CATEGORY, 'Token is expired or missing');
    }
    return isExpired;
  }

  cleanup(): void {
    logService.info(LOG_CATEGORY, 'Cleaning up token service');
    this.stopRefreshTimer();
    this.tokenInfo = null;
    this.currentUser = null;
  }
}

export const tokenService = TokenService.getInstance();
