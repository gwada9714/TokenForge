import { logger } from '@/utils/firebase-logger';
import { secureStorageService } from './secureStorageService';
import { firebaseAuth } from './firebaseAuth';
import { AuthError, AuthErrorCode } from '../errors/AuthError';

const LOG_CATEGORY = 'SessionService';

export interface SessionInfo {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
  deviceId: string;
}

export class SessionService {
  private static instance: SessionService;
  private currentSession: SessionInfo | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  private readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public async startSession(): Promise<void> {
    try {
      const user = await firebaseAuth.getCurrentUser();
      if (!user) {
        throw new AuthError('SESSION_NOT_FOUND' as AuthErrorCode, 'Aucun utilisateur connecté');
      }

      const token = await user.getIdToken();
      const deviceId = await this.getOrCreateDeviceId();

      this.currentSession = {
        sessionId: crypto.randomUUID(),
        createdAt: Date.now(),
        expiresAt: Date.now() + this.SESSION_DURATION,
        lastActivity: Date.now(),
        deviceId
      };

      await secureStorageService.setItem('session_info', this.currentSession);
      await secureStorageService.setAuthToken(token);

      this.startSessionCheck();
      logger.info('Session démarrée', { sessionId: this.currentSession.sessionId });
    } catch (error) {
      logger.error('Erreur lors du démarrage de la session', { error });
      throw error;
    }
  }

  public async validateSession(): Promise<boolean> {
    try {
      if (!this.currentSession) {
        const storedSession = await secureStorageService.getItem('session_info') as SessionInfo | null;
        if (!storedSession) return false;
        this.currentSession = storedSession;
      }

      const isValid = Date.now() < this.currentSession.expiresAt;
      if (isValid) {
        this.currentSession.lastActivity = Date.now();
        await secureStorageService.setItem('session_info', this.currentSession);
      }

      return isValid;
    } catch (error) {
      logger.error('Erreur lors de la validation de la session', { error });
      return false;
    }
  }

  public async refreshSession(): Promise<void> {
    try {
      const user = await firebaseAuth.getCurrentUser();
      if (!user || !this.currentSession) {
        throw new AuthError('SESSION_INVALID' as AuthErrorCode, 'Session invalide');
      }

      const token = await user.getIdToken(true);
      this.currentSession.expiresAt = Date.now() + this.SESSION_DURATION;
      this.currentSession.lastActivity = Date.now();

      await secureStorageService.setAuthToken(token);
      await secureStorageService.setItem('session_info', this.currentSession);

      logger.info('Session rafraîchie', { sessionId: this.currentSession.sessionId });
    } catch (error) {
      logger.error('Erreur lors du rafraîchissement de la session', { error });
      throw error;
    }
  }

  public async endSession(): Promise<void> {
    try {
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }

      await secureStorageService.removeItem('session_info');
      await secureStorageService.removeItem('auth_token');
      this.currentSession = null;

      logger.info('Session terminée');
    } catch (error) {
      logger.error('Erreur lors de la fin de la session', { error });
      throw error;
    }
  }

  private async getOrCreateDeviceId(): Promise<string> {
    const deviceId = await secureStorageService.getItem('device_id');
    if (deviceId) return deviceId as string;

    const newDeviceId = crypto.randomUUID();
    await secureStorageService.setItem('device_id', newDeviceId);
    return newDeviceId;
  }

  private startSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      const isValid = await this.validateSession();
      if (!isValid) {
        await this.endSession();
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      } else if (this.shouldRefreshSession()) {
        await this.refreshSession();
      }
    }, this.SESSION_CHECK_INTERVAL);
  }

  private shouldRefreshSession(): boolean {
    if (!this.currentSession) return false;
    const timeUntilExpiry = this.currentSession.expiresAt - Date.now();
    return timeUntilExpiry < this.SESSION_DURATION / 4;
  }
}

export const sessionService = SessionService.getInstance();

