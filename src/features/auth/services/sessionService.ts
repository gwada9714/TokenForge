import { auth } from '../../../config/firebase';
import { AuthPersistence } from '../store/authPersistence';
import { createAuthError } from '../errors/AuthError';
import { notificationService } from './notificationService';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

interface SessionInfo {
  expiresAt: number;
  lastActivity: number;
  refreshToken: string | null;
}

export class SessionService {
  private static instance: SessionService;
  private persistence: AuthPersistence;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private activeTimeouts: Set<NodeJS.Timeout> = new Set();

  private constructor() {
    this.persistence = AuthPersistence.getInstance();
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  async initSession(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw createAuthError('AUTH_001', 'No user found');
      }

      const state = await this.persistence.load();
      const sessionInfo: SessionInfo = {
        expiresAt: Date.now() + SESSION_TIMEOUT,
        lastActivity: Date.now(),
        refreshToken: await currentUser.getIdToken(),
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
      throw createAuthError('AUTH_002', 'Failed to initialize session', { originalError: error });
    }
  }

  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      try {
        const state = await this.persistence.load();
        const sessionInfo = state.sessionInfo as SessionInfo;

        if (!sessionInfo) return;

        const now = Date.now();
        const timeUntilExpiry = sessionInfo.expiresAt - now;

        // Si proche de l'expiration, rafraîchir la session
        if (timeUntilExpiry < REFRESH_THRESHOLD && timeUntilExpiry > 0) {
          await this.refreshSession();
        }
        // Si expiré, déconnecter
        else if (timeUntilExpiry <= 0) {
          await this.endSession();
          notificationService.warn('Session expirée. Veuillez vous reconnecter.');
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    }, 60000); // Vérifier toutes les minutes
  }

  async refreshSession(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw createAuthError('AUTH_003', 'No user found during refresh');
      }

      const state = await this.persistence.load();
      const sessionInfo: SessionInfo = {
        expiresAt: Date.now() + SESSION_TIMEOUT,
        lastActivity: Date.now(),
        refreshToken: await currentUser.getIdToken(true),
      };

      await this.persistence.save({
        ...state,
        sessionInfo,
      });
    } catch (error) {
      throw createAuthError('AUTH_004', 'Failed to refresh session', { originalError: error });
    }
  }

  async updateActivity(): Promise<void> {
    try {
      const state = await this.persistence.load();
      if (state.sessionInfo) {
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
    } catch (error) {
      throw createAuthError('AUTH_005', 'Failed to end session', { originalError: error });
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
}

export const sessionService = SessionService.getInstance();
