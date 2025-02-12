import { getFirebaseAuth } from '@/config/firebase';
import { 
  setAuthUser, 
  setSessionInfo, 
  setAuthError,
  resetAuthState 
} from '../store/authSlice';
import { store, type RootState } from '@/store';
import { logger } from '@/utils/logger';
import { AuthErrorCode } from '../errors/AuthError';
import type { User } from '../schemas/auth.schema';
import type { SessionInfo as AuthSchemaSessionInfo } from '../schemas/auth.schema';

interface TokenForgeMetadata {
  creationTime: string;
  lastSignInTime: string;
  lastLoginTime?: number;
  walletAddress?: string;
  chainId?: number;
  customMetadata: Record<string, unknown>;
}

interface TokenForgeUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: TokenForgeMetadata;
  refreshToken: string;
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
  walletAddress?: string;
  chainId?: number;
  customClaims?: Record<string, unknown>;
}

interface SessionInfo {
  expiresAt: number;
  lastActivity: number;
  refreshToken: string | null;
  tabId?: string;
  lastSync?: number;
}

export class SessionService {
  private static instance: SessionService;
  private checkSessionTimeout: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // 1 minute

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  startSessionCheck(): void {
    if (this.checkSessionTimeout) {
      clearInterval(this.checkSessionTimeout);
    }

    this.checkSessionTimeout = setInterval(() => {
      this.checkSession().catch(error => {
        logger.error('Erreur lors de la vérification de session:', {
          error,
          component: 'SessionService',
          action: 'checkSession'
        });
        
        store.dispatch(setAuthError({
          code: AuthErrorCode.SESSION_CHECK_ERROR,
          message: error instanceof Error ? error.message : 'Erreur lors de la vérification de session'
        }));
      });
    }, this.CHECK_INTERVAL);

    logger.info('Vérification de session démarrée', {
      component: 'SessionService',
      action: 'startSessionCheck'
    });
  }

  stopSessionCheck(): void {
    if (this.checkSessionTimeout) {
      clearInterval(this.checkSessionTimeout);
      this.checkSessionTimeout = null;
      logger.info('Vérification de session arrêtée', {
        component: 'SessionService',
        action: 'stopSessionCheck'
      });
    }
  }

  async checkSession(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        store.dispatch(resetAuthState());
        return;
      }

      const sessionInfo = await this.getSessionInfo();
      if (!sessionInfo || this.isSessionExpired(sessionInfo)) {
        await this.handleExpiredSession();
        return;
      }

      store.dispatch(setAuthUser(this.mapFirebaseUser(currentUser)));
      store.dispatch(setSessionInfo(sessionInfo));

    } catch (error) {
      logger.error('Erreur lors de la vérification de session:', {
        error,
        component: 'SessionService',
        action: 'checkSession'
      });
      
      store.dispatch(setAuthError({
        code: AuthErrorCode.SESSION_CHECK_ERROR,
        message: error instanceof Error ? error.message : 'Erreur lors de la vérification de session'
      }));
    }
  }

  async refreshSession(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        store.dispatch(setAuthError({
          code: AuthErrorCode.USER_NOT_FOUND,
          message: 'Aucun utilisateur connecté'
        }));
        return;
      }

      const now = Date.now();
      const sessionInfo: SessionInfo = {
        expiresAt: now + 30 * 60 * 1000, // 30 minutes
        lastActivity: now,
        refreshToken: currentUser.refreshToken || null
      };

      store.dispatch(setAuthUser(this.mapFirebaseUser(currentUser)));
      store.dispatch(setSessionInfo(sessionInfo));

      logger.info('Session rafraîchie avec succès', {
        component: 'SessionService',
        action: 'refreshSession'
      });

    } catch (error) {
      logger.error('Erreur lors du rafraîchissement de la session:', {
        error,
        component: 'SessionService',
        action: 'refreshSession'
      });

      store.dispatch(setAuthError({
        code: AuthErrorCode.SESSION_REFRESH_ERROR,
        message: error instanceof Error ? error.message : 'Erreur lors du rafraîchissement de la session'
      }));
    }
  }

  private async handleExpiredSession(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await auth.signOut();
      store.dispatch(resetAuthState());
      store.dispatch(setAuthError({
        code: AuthErrorCode.SESSION_EXPIRED,
        message: 'La session a expiré. Veuillez vous reconnecter.'
      }));
    } catch (error) {
      logger.error('Erreur lors de la déconnexion:', {
        error,
        component: 'SessionService',
        action: 'handleExpiredSession'
      });
    }
  }

  private async getSessionInfo(): Promise<SessionInfo | null> {
    try {
      const state = store.getState() as RootState;
      return state.auth.sessionInfo;
    } catch (error) {
      logger.error('Erreur lors de la récupération des informations de session:', {
        error,
        component: 'SessionService',
        action: 'getSessionInfo'
      });
      return null;
    }
  }

  private isSessionExpired(sessionInfo: SessionInfo): boolean {
    return sessionInfo.expiresAt < Date.now();
  }

  private mapFirebaseUser(firebaseUser: any): TokenForgeUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      isAnonymous: firebaseUser.isAnonymous,
      metadata: {
        creationTime: firebaseUser.metadata.creationTime,
        lastSignInTime: firebaseUser.metadata.lastSignInTime,
        lastLoginTime: Date.now(),
        customMetadata: {}
      },
      refreshToken: firebaseUser.refreshToken || '',
      isAdmin: false,
      canCreateToken: false,
      canUseServices: true,
      customClaims: firebaseUser.customClaims || {}
    };
  }
}

// Créer une instance unique du service de session
export const sessionService = SessionService.getInstance();
