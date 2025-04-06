import { User, UserCredential } from 'firebase/auth';
import { errorService, ErrorCode, ErrorSeverity } from '../../errors/ErrorService';
import { logger } from '../../logger';

/**
 * Types d'authentification supportés
 */
export enum AuthType {
  EMAIL_PASSWORD = 'email_password',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  GITHUB = 'github',
  APPLE = 'apple',
  PHONE = 'phone',
  ANONYMOUS = 'anonymous',
  WEB3 = 'web3',
  CUSTOM = 'custom'
}

/**
 * Informations d'identification pour la connexion
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Informations pour l'inscription
 */
export interface SignupCredentials {
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
}

/**
 * Réponse d'authentification
 */
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: Error;
  token?: string;
  expiresAt?: number;
}

/**
 * Options pour le service d'authentification
 */
export interface AuthServiceOptions {
  enablePersistence?: boolean;
  tokenRefreshInterval?: number;
  maxLoginAttempts?: number;
  lockoutDuration?: number;
  sessionTimeout?: number;
  requireEmailVerification?: boolean;
}

/**
 * Classe de base pour les services d'authentification
 */
export abstract class AuthServiceBase {
  protected options: AuthServiceOptions;
  protected tokenRefreshTimer: NodeJS.Timeout | null = null;
  protected loginAttempts: Map<string, number> = new Map();
  protected lockedAccounts: Map<string, number> = new Map();

  constructor(options: AuthServiceOptions = {}) {
    this.options = {
      enablePersistence: true,
      tokenRefreshInterval: 55 * 60 * 1000, // 55 minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: 60 * 60 * 1000, // 1 heure
      requireEmailVerification: true,
      ...options
    };
  }

  /**
   * Méthode abstraite pour la connexion
   */
  public abstract login(credentials: LoginCredentials): Promise<AuthResponse>;

  /**
   * Méthode abstraite pour l'inscription
   */
  public abstract signup(credentials: SignupCredentials): Promise<AuthResponse>;

  /**
   * Méthode abstraite pour la déconnexion
   */
  public abstract logout(): Promise<void>;

  /**
   * Méthode abstraite pour récupérer l'utilisateur actuel
   */
  public abstract getCurrentUser(): Promise<User | null>;

  /**
   * Méthode abstraite pour envoyer un email de réinitialisation de mot de passe
   */
  public abstract resetPassword(email: string): Promise<boolean>;

  /**
   * Méthode abstraite pour mettre à jour le profil utilisateur
   */
  public abstract updateUserProfile(user: User, profile: Partial<SignupCredentials>): Promise<User>;

  /**
   * Méthode abstraite pour vérifier si l'utilisateur est connecté
   */
  public abstract isAuthenticated(): Promise<boolean>;

  /**
   * Méthode abstraite pour obtenir un token d'authentification
   */
  public abstract getToken(forceRefresh?: boolean): Promise<string | null>;

  /**
   * Méthode abstraite pour configurer le rafraîchissement du token
   */
  protected abstract setupTokenRefresh(user: User): Promise<void>;

  /**
   * Méthode abstraite pour annuler le rafraîchissement du token
   */
  protected abstract clearTokenRefresh(): void;

  /**
   * Vérifie si un compte est bloqué en raison de trop nombreuses tentatives de connexion
   */
  protected isLoginBlocked(email: string): boolean {
    const lockTime = this.lockedAccounts.get(email);
    if (lockTime && Date.now() < lockTime) {
      return true;
    }
    
    if (lockTime) {
      this.lockedAccounts.delete(email);
    }
    
    return false;
  }

  /**
   * Incrémente le compteur de tentatives de connexion
   */
  protected incrementLoginAttempt(email: string): void {
    const attempts = (this.loginAttempts.get(email) || 0) + 1;
    this.loginAttempts.set(email, attempts);
    
    if (attempts >= this.options.maxLoginAttempts!) {
      this.lockAccount(email);
      this.loginAttempts.delete(email);
      
      logger.warn({
        category: 'Auth',
        message: `Compte verrouillé après ${attempts} tentatives de connexion échouées`,
        data: { email }
      });
    }
  }

  /**
   * Verrouille un compte
   */
  protected lockAccount(email: string): void {
    const unlockTime = Date.now() + this.options.lockoutDuration!;
    this.lockedAccounts.set(email, unlockTime);
    
    errorService.handleError(
      ErrorCode.AUTH_TOO_MANY_REQUESTS,
      `Trop de tentatives de connexion. Compte verrouillé pendant ${this.options.lockoutDuration! / 60000} minutes.`,
      ErrorSeverity.WARNING,
      { email }
    );
  }

  /**
   * Réinitialise le compteur de tentatives de connexion
   */
  protected resetLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
    this.lockedAccounts.delete(email);
  }

  /**
   * Vérifie si l'email est vérifié
   */
  protected checkEmailVerification(user: User): boolean {
    if (this.options.requireEmailVerification && !user.emailVerified) {
      errorService.handleError(
        ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
        'Veuillez vérifier votre email avant de vous connecter.',
        ErrorSeverity.WARNING,
        { email: user.email }
      );
      return false;
    }
    return true;
  }

  /**
   * Gère les erreurs d'authentification
   */
  protected handleAuthError(error: unknown, context: string): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error({
      category: 'Auth',
      message: `Erreur d'authentification: ${errorMessage}`,
      error: error instanceof Error ? error : new Error(errorMessage),
      data: { context }
    });
    
    return error instanceof Error ? error : new Error(errorMessage);
  }
}
