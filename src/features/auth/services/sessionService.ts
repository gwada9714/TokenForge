import { auth } from '../../../config/firebase';
import { TokenEncryption } from '../../../utils/token-encryption';
import { logger } from '../../../utils/firebase-logger';
import * as Sentry from '@sentry/react';

const LOG_CATEGORY = 'SessionService';

export class SessionService {
  private static instance: SessionService;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private activityTimeout: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600') * 1000;
  private readonly ACTIVITY_CHECK_INTERVAL = 60000; // 1 minute
  private lastActivity: number = Date.now();

  private constructor() {
    this.setupActivityListeners();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  private setupActivityListeners(): void {
    if (typeof window !== 'undefined') {
      // Liste des événements à surveiller pour l'activité utilisateur
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      events.forEach(event => {
        window.addEventListener(event, () => this.resetActivityTimer());
      });

      // Démarrer la vérification périodique de l'activité
      this.startActivityCheck();
    }
  }

  private startActivityCheck(): void {
    this.activityTimeout = setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivity;
      
      if (inactiveTime >= this.SESSION_DURATION) {
        this.endSession('inactivity');
      }

      // Métriques d'activité
      Sentry.metrics.distribution('session.inactive_time', inactiveTime, {
        tags: { 
          env: import.meta.env.VITE_ENV,
          threshold: this.SESSION_DURATION.toString()
        }
      });
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  private resetActivityTimer(): void {
    this.lastActivity = Date.now();
    
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      this.endSession('timeout');
    }, this.SESSION_DURATION);

    // Log de réinitialisation du timer pour debug
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
      logger.debug(LOG_CATEGORY, 'Session timer reset', {
        lastActivity: new Date(this.lastActivity).toISOString(),
        expiresAt: new Date(this.lastActivity + this.SESSION_DURATION).toISOString()
      });
    }
  }

  private async endSession(reason: 'timeout' | 'inactivity' | 'manual'): Promise<void> {
    try {
      // Nettoyage des timeouts
      if (this.sessionTimeout) {
        clearTimeout(this.sessionTimeout);
        this.sessionTimeout = null;
      }
      
      if (this.activityTimeout) {
        clearInterval(this.activityTimeout);
        this.activityTimeout = null;
      }

      // Nettoyage du token
      TokenEncryption.getInstance().clearStoredToken();

      // Déconnexion Firebase
      if (auth.currentUser) {
        await auth.signOut();
      }

      // Métriques de fin de session
      Sentry.metrics.increment('session.end', 1, {
        tags: { 
          reason,
          env: import.meta.env.VITE_ENV
        }
      });

      logger.info(LOG_CATEGORY, 'Session ended', { reason });
    } catch (error) {
      logger.error(LOG_CATEGORY, 'Error ending session', error);
      Sentry.captureException(error);
    }
  }

  public startSession(): void {
    this.resetActivityTimer();
    logger.info(LOG_CATEGORY, 'Session started', {
      duration: this.SESSION_DURATION,
      checkInterval: this.ACTIVITY_CHECK_INTERVAL
    });
  }

  public async logout(): Promise<void> {
    await this.endSession('manual');
  }

  public isSessionActive(): boolean {
    return Date.now() - this.lastActivity < this.SESSION_DURATION;
  }

  public getSessionInfo(): { lastActivity: Date; expiresAt: Date } {
    return {
      lastActivity: new Date(this.lastActivity),
      expiresAt: new Date(this.lastActivity + this.SESSION_DURATION)
    };
  }
}

// Créer une instance unique du service de session
export const sessionService = SessionService.getInstance();
