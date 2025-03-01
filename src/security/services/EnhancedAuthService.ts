import { Auth, getAuth, User, signInWithEmailAndPassword, signOut, AuthErrorCodes } from 'firebase/auth';
import { app, firebaseService } from '@/config/firebase';
import { logger } from '@/utils/logger';
import type { LoginCredentials, AuthResponse, AuthError } from '@/auth/types/auth.types';
import { SessionService } from '@/services/session/sessionService';

/**
 * Service d'authentification amélioré avec des fonctionnalités de sécurité supplémentaires
 * - Détection d'activités suspectes
 * - Vérification d'intégrité du token
 * - Protection contre les attaques de force brute
 * - Journalisation des événements de sécurité
 */
export class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  private auth: Auth;
  private readonly TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes (plus fréquent que l'original)
  private tokenRefreshIntervals: Map<string, number> = new Map();
  private loginAttempts: Map<string, { count: number, lastAttempt: number }> = new Map();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_ATTEMPT_RESET_TIME = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_SERVICE = SessionService.getInstance();

  private constructor() {
    this.auth = getAuth(app);
    this.setupAuthListeners();
    
    // Vérifier si l'utilisateur est déjà connecté au démarrage
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.setupTokenRefresh(currentUser).catch(error => {
        logger.error('EnhancedAuth', 'Erreur lors de la configuration du rafraîchissement du token au démarrage', error);
      });
    }
  }

  private setupAuthListeners(): void {
    this.auth.onAuthStateChanged(
      (user) => this.handleAuthStateChange(user),
      (error) => this.handleAuthError(error)
    );
  }

  private async handleAuthStateChange(user: User | null): Promise<void> {
    if (user) {
      // Vérifier l'intégrité du token
      await this.verifyTokenIntegrity(user);
      
      // Configurer le rafraîchissement du token
      await this.setupTokenRefresh(user);
      
      // Journaliser l'événement de connexion
      this.logSecurityEvent('login', user.uid, {
        email: user.email,
        emailVerified: user.emailVerified,
        provider: user.providerData[0]?.providerId || 'unknown'
      });
    } else {
      // Nettoyer les intervalles existants lors de la déconnexion
      this.clearAllTokenRefreshIntervals();
      
      // Journaliser l'événement de déconnexion si un utilisateur était connecté
      if (this.auth.currentUser) {
        this.logSecurityEvent('logout', this.auth.currentUser.uid);
      }
    }
  }

  /**
   * Vérifie l'intégrité du token d'authentification
   * @param user Utilisateur Firebase
   */
  private async verifyTokenIntegrity(user: User): Promise<void> {
    try {
      // Récupérer le token ID
      const token = await user.getIdToken();
      
      // Vérifier que le token contient les claims attendus
      const decodedToken = await user.getIdTokenResult();
      
      // Vérifier l'émetteur du token
      if (!decodedToken.claims.iss?.includes('securetoken.google.com')) {
        throw new Error('Token émetteur invalide');
      }
      
      // Vérifier l'audience du token
      if (decodedToken.claims.aud !== app.options.projectId) {
        throw new Error('Token audience invalide');
      }
      
      // Vérifier l'expiration du token
      const expirationTime = new Date(decodedToken.expirationTime).getTime();
      const currentTime = Date.now();
      
      if (expirationTime <= currentTime) {
        throw new Error('Token expiré');
      }
      
      logger.info('EnhancedAuth', 'Vérification d\'intégrité du token réussie', {
        tokenLength: token.length,
        expiresIn: Math.floor((expirationTime - currentTime) / 1000)
      });
    } catch (error) {
      logger.error('EnhancedAuth', 'Échec de la vérification d\'intégrité du token', error);
      
      // Forcer la déconnexion en cas d'échec de vérification
      await this.logout();
      throw error;
    }
  }

  private async setupTokenRefresh(user: User): Promise<void> {
    try {
      // Nettoyer tout intervalle existant pour cet utilisateur
      this.clearTokenRefreshInterval(user.uid);
      
      // Vérifier si l'utilisateur est toujours valide
      if (!user.uid) {
        logger.warn('EnhancedAuth', 'Tentative de rafraîchissement de token pour un utilisateur non valide');
        return;
      }
      
      // Rafraîchir le token immédiatement
      try {
        const token = await user.getIdToken(true);
        logger.info('EnhancedAuth', 'Token initial obtenu avec succès', { tokenLength: token.length });
      } catch (error) {
        logger.error('EnhancedAuth', 'Échec de l\'obtention du token initial', error);
        throw error; // Propager l'erreur pour éviter de configurer un intervalle qui échouera
      }
      
      // Configurer un nouvel intervalle avec une fonction de rafraîchissement robuste
      const intervalId = window.setInterval(async () => {
        try {
          // Vérifier si l'utilisateur est toujours connecté
          const currentUser = this.auth.currentUser;
          if (!currentUser || currentUser.uid !== user.uid) {
            logger.warn('EnhancedAuth', 'Utilisateur déconnecté, arrêt du rafraîchissement du token');
            this.clearTokenRefreshInterval(user.uid);
            return;
          }
          
          // Vérifier l'intégrité du token avant le rafraîchissement
          await this.verifyTokenIntegrity(currentUser);
          
          const token = await user.getIdToken(true);
          logger.info('EnhancedAuth', 'Token rafraîchi avec succès', { tokenLength: token.length });
          
          // Prolonger la session
          this.SESSION_SERVICE.extendSession();
        } catch (error) {
          logger.error('EnhancedAuth', 'Échec du rafraîchissement du token', error);
          
          // Analyser l'erreur pour déterminer si nous devons arrêter les tentatives
          const authError = error as AuthError;
          if (authError.code === AuthErrorCodes.TOKEN_EXPIRED || 
              authError.code === AuthErrorCodes.USER_DISABLED ||
              authError.code === AuthErrorCodes.USER_DELETED) {
            logger.warn('EnhancedAuth', 'Arrêt du rafraîchissement du token en raison d\'une erreur critique', { code: authError.code });
            this.clearTokenRefreshInterval(user.uid);
            
            // Forcer la déconnexion si l'utilisateur n'est plus valide
            this.logout().catch(e => {
              logger.error('EnhancedAuth', 'Échec de la déconnexion forcée après erreur de token', e);
            });
          }
        }
      }, this.TOKEN_REFRESH_INTERVAL);
      
      // Stocker l'ID de l'intervalle pour pouvoir le nettoyer plus tard
      this.tokenRefreshIntervals.set(user.uid, intervalId);
      logger.info('EnhancedAuth', 'Rafraîchissement de token configuré avec succès', { userId: user.uid });
    } catch (error) {
      logger.error('EnhancedAuth', 'Échec de la configuration du rafraîchissement du token', error);
      throw error;
    }
  }

  private clearTokenRefreshInterval(userId: string): void {
    const intervalId = this.tokenRefreshIntervals.get(userId);
    if (intervalId) {
      window.clearInterval(intervalId);
      this.tokenRefreshIntervals.delete(userId);
    }
  }

  private clearAllTokenRefreshIntervals(): void {
    this.tokenRefreshIntervals.forEach((intervalId) => {
      window.clearInterval(intervalId);
    });
    this.tokenRefreshIntervals.clear();
  }

  private handleAuthError(error: Error): void {
    logger.error('EnhancedAuth', 'Erreur de changement d\'état d\'authentification', error);
  }

  /**
   * Journalise un événement de sécurité
   * @param eventType Type d'événement
   * @param userId ID de l'utilisateur
   * @param metadata Métadonnées supplémentaires
   */
  private logSecurityEvent(eventType: string, userId: string, metadata: Record<string, any> = {}): void {
    const event = {
      type: eventType,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'client-side', // L'IP réelle serait capturée côté serveur
      ...metadata
    };
    
    logger.info('SecurityEvent', `Événement de sécurité: ${eventType}`, event);
    
    // Dans une implémentation réelle, on enverrait ces événements à un service de monitoring
  }

  /**
   * Vérifie si l'utilisateur a dépassé le nombre maximum de tentatives de connexion
   * @param email Email de l'utilisateur
   * @returns true si l'utilisateur est bloqué, false sinon
   */
  private isLoginBlocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    
    if (!attempts) {
      return false;
    }
    
    const now = Date.now();
    
    // Réinitialiser les tentatives si le temps de blocage est écoulé
    if (now - attempts.lastAttempt > this.LOGIN_ATTEMPT_RESET_TIME) {
      this.loginAttempts.delete(email);
      return false;
    }
    
    return attempts.count >= this.MAX_LOGIN_ATTEMPTS;
  }

  /**
   * Enregistre une tentative de connexion échouée
   * @param email Email de l'utilisateur
   */
  private recordFailedLoginAttempt(email: string): void {
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    
    this.loginAttempts.set(email, attempts);
    
    logger.warn('EnhancedAuth', 'Tentative de connexion échouée', { 
      email, 
      attemptCount: attempts.count,
      isBlocked: attempts.count >= this.MAX_LOGIN_ATTEMPTS
    });
  }

  public static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Vérifier si l'utilisateur est bloqué en raison de trop nombreuses tentatives
      if (this.isLoginBlocked(credentials.email)) {
        return {
          success: false,
          error: {
            code: 'auth/too-many-requests',
            message: `Trop de tentatives de connexion. Veuillez réessayer après ${this.LOGIN_ATTEMPT_RESET_TIME / 60000} minutes.`
          }
        };
      }
      
      // S'assurer que Firebase est initialisé
      if (!firebaseService.isInitialized()) {
        await firebaseService.initialize();
      }
      
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // Vérifier l'intégrité du token
      await this.verifyTokenIntegrity(userCredential.user);

      // Configurer le rafraîchissement du token après la connexion
      await this.setupTokenRefresh(userCredential.user);

      // Journaliser l'événement de connexion réussie
      this.logSecurityEvent('login_success', userCredential.user.uid, {
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      });

      // Réinitialiser les tentatives de connexion
      this.loginAttempts.delete(credentials.email);

      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      const authError = error as AuthError;
      logger.error('EnhancedAuth', 'Échec de connexion', error);
      
      // Enregistrer la tentative de connexion échouée
      this.recordFailedLoginAttempt(credentials.email);
      
      // Journaliser l'événement de connexion échouée
      this.logSecurityEvent('login_failure', 'unknown', {
        email: credentials.email,
        errorCode: authError.code
      });
      
      // Fournir des messages d'erreur plus spécifiques
      let errorMessage = 'Échec de connexion';
      
      if (authError.code) {
        switch (authError.code) {
          case 'auth/invalid-email':
            errorMessage = 'Adresse email invalide';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Ce compte a été désactivé';
            break;
          case 'auth/user-not-found':
            errorMessage = 'Aucun compte trouvé avec cette adresse email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Mot de passe incorrect';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet';
            break;
          default:
            errorMessage = `Erreur de connexion: ${authError.code}`;
        }
      }
      
      return {
        success: false,
        error: {
          ...authError,
          message: errorMessage
        }
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Nettoyer les intervalles avant la déconnexion
      this.clearAllTokenRefreshIntervals();
      
      // Vérifier si l'utilisateur est connecté avant de tenter la déconnexion
      if (this.auth.currentUser) {
        const userId = this.auth.currentUser.uid;
        
        await signOut(this.auth);
        
        // Journaliser l'événement de déconnexion
        this.logSecurityEvent('logout_success', userId);
        
        logger.info('EnhancedAuth', 'Déconnexion réussie');
      } else {
        logger.info('EnhancedAuth', 'Déconnexion ignorée - aucun utilisateur connecté');
      }
    } catch (error) {
      logger.error('EnhancedAuth', 'Échec de déconnexion', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.auth.onAuthStateChanged(callback);
  }
}

export const enhancedAuthService = EnhancedAuthService.getInstance();
