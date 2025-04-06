import { User } from "firebase/auth";
import { logger } from "../../logger";
import {
  errorService,
  ErrorCode,
  ErrorSeverity,
} from "../../errors/ErrorService";
import { configService } from "../../config";
import {
  AuthServiceBase,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  AuthServiceOptions,
  AuthType,
} from "./AuthServiceBase";
import { FirebaseAuthService } from "./FirebaseAuthService";
import { Web3AuthService, Web3Credentials } from "./Web3AuthService";

/**
 * Service d'authentification unifié qui peut utiliser différents fournisseurs
 */
export class AuthService {
  private static instance: AuthService;
  private firebaseAuthService: FirebaseAuthService;
  private web3AuthService: Web3AuthService;
  private currentAuthType: AuthType | null = null;

  private constructor(options: AuthServiceOptions = {}) {
    // Fusionner les options avec les valeurs de configuration
    const securityConfig = configService.getSecurityConfig();
    const mergedOptions: AuthServiceOptions = {
      enablePersistence: true,
      tokenRefreshInterval: 55 * 60 * 1000, // 55 minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: securityConfig.session.timeout * 1000,
      requireEmailVerification: true,
      ...options,
    };

    this.firebaseAuthService = FirebaseAuthService.getInstance(mergedOptions);
    this.web3AuthService = Web3AuthService.getInstance(mergedOptions);

    // Déterminer le type d'authentification actuel
    this.checkCurrentAuthType();

    logger.info({
      category: "Auth",
      message: "Service d'authentification unifié initialisé",
    });
  }

  /**
   * Obtient l'instance singleton du service d'authentification
   */
  public static getInstance(options: AuthServiceOptions = {}): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(options);
    }
    return AuthService.instance;
  }

  /**
   * Vérifie le type d'authentification actuel
   */
  private async checkCurrentAuthType(): Promise<void> {
    // Vérifier d'abord Firebase
    const firebaseUser = await this.firebaseAuthService.getCurrentUser();
    if (firebaseUser) {
      this.currentAuthType = AuthType.EMAIL_PASSWORD;
      return;
    }

    // Ensuite vérifier Web3
    const web3User = await this.web3AuthService.getCurrentUser();
    if (web3User) {
      this.currentAuthType = AuthType.WEB3;
      return;
    }

    this.currentAuthType = null;
  }

  /**
   * Connecte un utilisateur avec le type d'authentification spécifié
   */
  public async login(
    credentials: LoginCredentials | Web3Credentials,
    authType: AuthType = AuthType.EMAIL_PASSWORD
  ): Promise<AuthResponse> {
    try {
      let response: AuthResponse;

      switch (authType) {
        case AuthType.EMAIL_PASSWORD:
        case AuthType.GOOGLE:
        case AuthType.FACEBOOK:
        case AuthType.TWITTER:
        case AuthType.GITHUB:
        case AuthType.APPLE:
        case AuthType.PHONE:
        case AuthType.ANONYMOUS:
          response = await this.firebaseAuthService.login(
            credentials as LoginCredentials
          );
          break;
        case AuthType.WEB3:
          response = await this.web3AuthService.login(
            credentials as Web3Credentials
          );
          break;
        default:
          return {
            success: false,
            error: new Error(
              `Type d'authentification non supporté: ${authType}`
            ),
          };
      }

      if (response.success) {
        this.currentAuthType = authType;
      }

      return response;
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Erreur lors de la connexion",
        error: error instanceof Error ? error : new Error(String(error)),
        data: { authType },
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Inscrit un nouvel utilisateur
   */
  public async signup(
    credentials: SignupCredentials,
    authType: AuthType = AuthType.EMAIL_PASSWORD
  ): Promise<AuthResponse> {
    try {
      let response: AuthResponse;

      switch (authType) {
        case AuthType.EMAIL_PASSWORD:
          response = await this.firebaseAuthService.signup(credentials);
          break;
        case AuthType.WEB3:
          response = await this.web3AuthService.signup();
          break;
        default:
          return {
            success: false,
            error: new Error(
              `Type d'authentification non supporté pour l'inscription: ${authType}`
            ),
          };
      }

      if (response.success) {
        this.currentAuthType = authType;
      }

      return response;
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Erreur lors de l'inscription",
        error: error instanceof Error ? error : new Error(String(error)),
        data: { authType },
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Déconnecte l'utilisateur actuel
   */
  public async logout(): Promise<void> {
    try {
      if (this.currentAuthType === AuthType.WEB3) {
        await this.web3AuthService.logout();
      } else {
        await this.firebaseAuthService.logout();
      }

      this.currentAuthType = null;
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Erreur lors de la déconnexion",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  public async getCurrentUser(): Promise<User | any | null> {
    try {
      if (this.currentAuthType === AuthType.WEB3) {
        return await this.web3AuthService.getCurrentUser();
      } else {
        return await this.firebaseAuthService.getCurrentUser();
      }
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Erreur lors de la récupération de l'utilisateur actuel",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  public async resetPassword(email: string): Promise<boolean> {
    try {
      return await this.firebaseAuthService.resetPassword(email);
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Erreur lors de la réinitialisation du mot de passe",
        error: error instanceof Error ? error : new Error(String(error)),
        data: { email },
      });
      throw error;
    }
  }

  /**
   * Met à jour le profil de l'utilisateur
   */
  public async updateUserProfile(
    user: User,
    profile: Partial<SignupCredentials>
  ): Promise<User> {
    try {
      if (this.currentAuthType === AuthType.WEB3) {
        throw new Error(
          "La mise à jour du profil n'est pas supportée pour l'authentification Web3"
        );
      }

      return await this.firebaseAuthService.updateUserProfile(user, profile);
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Erreur lors de la mise à jour du profil utilisateur",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      if (this.currentAuthType === AuthType.WEB3) {
        return await this.web3AuthService.isAuthenticated();
      } else {
        return await this.firebaseAuthService.isAuthenticated();
      }
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Erreur lors de la vérification de l'authentification",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }

  /**
   * Obtient un token d'authentification
   */
  public async getToken(forceRefresh: boolean = false): Promise<string | null> {
    try {
      if (this.currentAuthType === AuthType.WEB3) {
        return await this.web3AuthService.getToken(forceRefresh);
      } else {
        return await this.firebaseAuthService.getToken(forceRefresh);
      }
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Erreur lors de l'obtention du token",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }

  /**
   * S'abonne aux changements d'état d'authentification Firebase
   */
  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.firebaseAuthService.onAuthStateChanged(callback);
  }

  /**
   * Obtient le type d'authentification actuel
   */
  public getCurrentAuthType(): AuthType | null {
    return this.currentAuthType;
  }
}

// Exporter l'instance singleton
export const authService = AuthService.getInstance();
