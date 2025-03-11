import { Auth, User } from 'firebase/auth';
import { firebaseService } from '@/config/firebase';
import { getFirebaseAuth, initializeAuth } from '@/lib/firebase/auth';
import { logger } from '@/utils/logger';
import { AUTH_CONFIG } from '@/config/constants';

export enum SessionState {
  INITIALIZING = 'INITIALIZING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  ERROR = 'ERROR'
}

export class SessionService {
  private static instance: SessionService;
  private currentState: SessionState = SessionState.INITIALIZING;
  private auth: Auth | null = null;
  private sessionTimeout: number | null = null;
  private lastActivity: number = Date.now();
  private readonly SESSION_CHECK_INTERVAL = 60 * 1000; // Vérifier l'activité toutes les minutes
  private sessionCheckIntervalId: number | null = null;

  private constructor() {
    // Initialisation différée de l'auth
    this.initAuth().catch(error => {
      logger.error('Session', 'Erreur lors de l\'initialisation de l\'authentification', 
        error instanceof Error ? error : new Error(String(error))
      );
    });
    this.setupSessionMonitoring();
  }

  private async initAuth(): Promise<void> {
    try {
      await initializeAuth();
      this.auth = getFirebaseAuth();
    } catch (error) {
      this.currentState = SessionState.ERROR;
      throw error;
    }
  }

  /**
   * Configure la surveillance de session pour détecter l'inactivité
   */
  private setupSessionMonitoring(): void {
    // Écouter les événements d'activité utilisateur
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.updateLastActivity());
    });
    
    // Démarrer l'intervalle de vérification de session
    this.sessionCheckIntervalId = window.setInterval(() => {
      this.checkSessionActivity();
    }, this.SESSION_CHECK_INTERVAL);
  }

  /**
   * Met à jour le timestamp de dernière activité
   */
  private updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  /**
   * Vérifie l'activité de la session et déconnecte l'utilisateur si inactif trop longtemps
   */
  private checkSessionActivity(): void {
    if (this.currentState !== SessionState.AUTHENTICATED) {
      return; // Ne vérifier que si l'utilisateur est authentifié
    }
    
    const now = Date.now();
    const inactiveTime = now - this.lastActivity;
    
    // Si inactif pendant plus longtemps que la durée de session configurée
    if (inactiveTime > AUTH_CONFIG.SESSION_DURATION) {
      logger.warn('Session', 'Session expirée en raison d\'inactivité', { 
        inactiveTime, 
        threshold: AUTH_CONFIG.SESSION_DURATION 
      });
      
      // Déconnecter l'utilisateur
      this.endSession().catch(error => {
        logger.error('Session', 'Erreur lors de la terminaison de session pour inactivité', 
          error instanceof Error ? error : new Error(String(error))
        );
      });
    }
  }

  /**
   * Nettoie les ressources de surveillance de session
   * Appelé lors de la destruction du service
   */
  private cleanupSessionMonitoring(): void {
    if (this.sessionCheckIntervalId !== null) {
      window.clearInterval(this.sessionCheckIntervalId);
      this.sessionCheckIntervalId = null;
    }
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public getCurrentState(): SessionState {
    return this.currentState;
  }

  async startSession(): Promise<void> {
    try {
      this.currentState = SessionState.INITIALIZING;
      
      // S'assurer que Firebase est initialisé
      if (!firebaseService.isInitialized()) {
        await firebaseService.initialize();
      }
      
      // S'assurer que l'authentification est initialisée
      if (!this.auth) {
        await this.initAuth();
      }
      
      const auth = this.auth!; // Non-null assertion pour TypeScript
      const user: User | null = auth.currentUser;

      if (!user) {
        this.currentState = SessionState.UNAUTHENTICATED;
        logger.info('Session', 'Session non authentifiée');
        return;
      }

      // Vérifier la validité du token
      try {
        await user.getIdToken(true);
      } catch (error) {
        logger.error('Session', 'Token invalide lors du démarrage de la session', 
          error instanceof Error ? error : new Error(String(error))
        );
        this.currentState = SessionState.ERROR;
        throw error;
      }

      this.currentState = SessionState.AUTHENTICATED;
      this.updateLastActivity(); // Mettre à jour le timestamp d'activité
      
      logger.info('Session', 'Session démarrée avec succès', { userId: user.uid });
    } catch (error) {
      this.currentState = SessionState.ERROR;
      logger.error('Session', 'Erreur lors du démarrage de la session', 
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async endSession(): Promise<void> {
    try {
      // Nettoyer tout timeout de session existant
      if (this.sessionTimeout !== null) {
        window.clearTimeout(this.sessionTimeout);
        this.sessionTimeout = null;
      }
      
      // Nettoyer les ressources de surveillance
      this.cleanupSessionMonitoring();
      
      // S'assurer que l'authentification est initialisée
      if (!this.auth) {
        await this.initAuth();
      }
      
      const auth = this.auth!; // Non-null assertion pour TypeScript
      await auth.signOut();
      this.currentState = SessionState.UNAUTHENTICATED;
      logger.info('Session', 'Session terminée avec succès');
    } catch (error) {
      logger.error('Session', 'Erreur lors de la terminaison de la session', 
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Prolonge la session actuelle en mettant à jour le timestamp d'activité
   */
  public extendSession(): void {
    if (this.currentState === SessionState.AUTHENTICATED) {
      this.updateLastActivity();
      logger.debug('Session', 'Session prolongée');
    }
  }

  /**
   * Vérifie si la session est active et valide
   */
  public async validateSession(): Promise<boolean> {
    if (this.currentState !== SessionState.AUTHENTICATED) {
      return false;
    }

    try {
      if (!this.auth) {
        await this.initAuth();
      }
      
      const auth = this.auth!; // Non-null assertion pour TypeScript
      const user = auth.currentUser;
      if (!user) {
        this.currentState = SessionState.UNAUTHENTICATED;
        return false;
      }

      // Vérifier la validité du token
      await user.getIdToken(false); // Ne pas forcer le rafraîchissement
      return true;
    } catch (error) {
      logger.error('Session', 'Erreur lors de la validation de la session', 
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }
}
