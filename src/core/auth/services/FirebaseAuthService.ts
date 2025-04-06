import {
  Auth,
  getAuth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  AuthErrorCodes,
  sendEmailVerification,
  UserCredential,
} from "firebase/auth";
import { initializeApp, FirebaseApp } from "firebase/app";
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
} from "./AuthServiceBase";

/**
 * Interface pour les erreurs d'authentification Firebase
 */
interface FirebaseAuthError extends Error {
  code?: string;
  customData?: Record<string, unknown>;
}

/**
 * Service d'authentification Firebase implémentant AuthServiceBase
 */
export class FirebaseAuthService extends AuthServiceBase {
  private static instance: FirebaseAuthService;
  private auth: Auth;
  private app: FirebaseApp;
  private tokenRefreshIntervals: Map<string, number> = new Map();

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

    super(mergedOptions);

    // Initialiser Firebase avec la configuration
    const firebaseConfig = configService.getFirebaseConfig();
    this.app = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId,
    });

    this.auth = getAuth(this.app);
    this.setupAuthListeners();

    // Vérifier si l'utilisateur est déjà connecté au démarrage
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.setupTokenRefresh(currentUser).catch((error) => {
        logger.error({
          category: "Auth",
          message:
            "Erreur lors de la configuration du rafraîchissement du token au démarrage",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });
    }

    logger.info({
      category: "Auth",
      message: "Service d'authentification Firebase initialisé",
      data: {
        projectId: firebaseConfig.projectId,
        useEmulator: firebaseConfig.useEmulator,
      },
    });
  }

  /**
   * Obtient l'instance singleton du service d'authentification
   */
  public static getInstance(
    options: AuthServiceOptions = {}
  ): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService(options);
    }
    return FirebaseAuthService.instance;
  }

  private setupAuthListeners(): void {
    this.auth.onAuthStateChanged(
      (user) => this.handleAuthStateChange(user),
      (error) => this.handleAuthError(error)
    );
  }

  private async handleAuthStateChange(user: User | null): Promise<void> {
    if (user) {
      await this.setupTokenRefresh(user);
    } else {
      // Nettoyer les intervalles existants lors de la déconnexion
      this.clearAllTokenRefreshIntervals();
    }
  }

  /**
   * Connecte un utilisateur avec email et mot de passe
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Vérifier si le compte est bloqué
      if (this.isLoginBlocked(credentials.email)) {
        return {
          success: false,
          error: new Error(
            `Trop de tentatives de connexion. Veuillez réessayer après ${
              this.options.lockoutDuration! / 60000
            } minutes.`
          ),
        };
      }

      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // Vérifier si l'email est vérifié si nécessaire
      if (
        this.options.requireEmailVerification &&
        !userCredential.user.emailVerified
      ) {
        // Envoyer un email de vérification
        await sendEmailVerification(userCredential.user);

        // Déconnecter l'utilisateur
        await this.logout();

        return {
          success: false,
          error: new Error(
            "Veuillez vérifier votre email avant de vous connecter. Un nouvel email de vérification a été envoyé."
          ),
        };
      }

      // Réinitialiser les tentatives de connexion
      this.resetLoginAttempts(credentials.email);

      // Configurer le rafraîchissement du token après la connexion
      await this.setupTokenRefresh(userCredential.user);

      logger.info({
        category: "Auth",
        message: "Utilisateur connecté avec succès",
        data: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        },
      });

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      // Incrémenter les tentatives de connexion
      this.incrementLoginAttempt(credentials.email);

      const authError = error as FirebaseAuthError;
      logger.error({
        category: "Auth",
        message: "Échec de connexion",
        error: authError,
        data: { email: credentials.email },
      });

      // Fournir des messages d'erreur plus spécifiques
      let errorMessage = "Échec de connexion";

      if (authError.code) {
        switch (authError.code) {
          case "auth/invalid-email":
            errorMessage = "Adresse email invalide";
            break;
          case "auth/user-disabled":
            errorMessage = "Ce compte a été désactivé";
            break;
          case "auth/user-not-found":
            errorMessage = "Aucun compte trouvé avec cette adresse email";
            break;
          case "auth/wrong-password":
            errorMessage = "Mot de passe incorrect";
            break;
          case "auth/too-many-requests":
            errorMessage =
              "Trop de tentatives de connexion. Veuillez réessayer plus tard";
            break;
          case "auth/network-request-failed":
            errorMessage =
              "Problème de connexion réseau. Vérifiez votre connexion internet";
            break;
          default:
            errorMessage = `Erreur de connexion: ${authError.code}`;
        }
      }

      return {
        success: false,
        error: new Error(errorMessage),
      };
    }
  }

  /**
   * Inscrit un nouvel utilisateur avec email et mot de passe
   */
  public async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      // Créer l'utilisateur
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // Mettre à jour le profil si nécessaire
      if (credentials.displayName || credentials.photoURL) {
        await updateProfile(userCredential.user, {
          displayName: credentials.displayName,
          photoURL: credentials.photoURL,
        });
      }

      // Envoyer un email de vérification si nécessaire
      if (this.options.requireEmailVerification) {
        await sendEmailVerification(userCredential.user);

        logger.info({
          category: "Auth",
          message: "Email de vérification envoyé",
          data: { email: credentials.email },
        });

        // Déconnecter l'utilisateur jusqu'à ce que l'email soit vérifié
        await this.logout();

        return {
          success: true,
          user: userCredential.user,
          error: new Error(
            "Un email de vérification a été envoyé. Veuillez vérifier votre email avant de vous connecter."
          ),
        };
      }

      // Configurer le rafraîchissement du token
      await this.setupTokenRefresh(userCredential.user);

      logger.info({
        category: "Auth",
        message: "Utilisateur inscrit avec succès",
        data: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        },
      });

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      const authError = error as FirebaseAuthError;
      logger.error({
        category: "Auth",
        message: "Échec d'inscription",
        error: authError,
        data: { email: credentials.email },
      });

      // Fournir des messages d'erreur plus spécifiques
      let errorMessage = "Échec d'inscription";

      if (authError.code) {
        switch (authError.code) {
          case "auth/email-already-in-use":
            errorMessage = "Cette adresse email est déjà utilisée";
            break;
          case "auth/invalid-email":
            errorMessage = "Adresse email invalide";
            break;
          case "auth/weak-password":
            errorMessage = "Le mot de passe est trop faible";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "L'inscription avec email et mot de passe n'est pas activée";
            break;
          default:
            errorMessage = `Erreur d'inscription: ${authError.code}`;
        }
      }

      return {
        success: false,
        error: new Error(errorMessage),
      };
    }
  }

  /**
   * Déconnecte l'utilisateur actuel
   */
  public async logout(): Promise<void> {
    try {
      // Nettoyer les intervalles avant la déconnexion
      this.clearAllTokenRefreshIntervals();

      // Vérifier si l'utilisateur est connecté avant de tenter la déconnexion
      if (this.auth.currentUser) {
        await signOut(this.auth);
        logger.info({
          category: "Auth",
          message: "Déconnexion réussie",
        });
      } else {
        logger.info({
          category: "Auth",
          message: "Déconnexion ignorée - aucun utilisateur connecté",
        });
      }
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Échec de déconnexion",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  public async getCurrentUser(): Promise<User | null> {
    return this.auth.currentUser;
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  public async resetPassword(email: string): Promise<boolean> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      logger.info({
        category: "Auth",
        message: "Email de réinitialisation de mot de passe envoyé",
        data: { email },
      });
      return true;
    } catch (error) {
      const authError = error as FirebaseAuthError;
      logger.error({
        category: "Auth",
        message: "Échec d'envoi d'email de réinitialisation de mot de passe",
        error: authError,
        data: { email },
      });

      // Gérer les erreurs spécifiques
      if (authError.code === "auth/user-not-found") {
        // Ne pas révéler que l'utilisateur n'existe pas pour des raisons de sécurité
        return true;
      }

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
      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      });

      logger.info({
        category: "Auth",
        message: "Profil utilisateur mis à jour",
        data: { uid: user.uid },
      });

      return user;
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Échec de mise à jour du profil utilisateur",
        error: error instanceof Error ? error : new Error(String(error)),
        data: { uid: user.uid },
      });
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  public async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  /**
   * Obtient un token d'authentification
   */
  public async getToken(forceRefresh: boolean = false): Promise<string | null> {
    const user = await this.getCurrentUser();
    if (!user) {
      return null;
    }

    try {
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Échec d'obtention du token",
        error: error instanceof Error ? error : new Error(String(error)),
        data: { uid: user.uid },
      });
      return null;
    }
  }

  /**
   * Configure le rafraîchissement automatique du token
   */
  protected async setupTokenRefresh(user: User): Promise<void> {
    try {
      // Nettoyer tout intervalle existant pour cet utilisateur
      this.clearTokenRefreshInterval(user.uid);

      // Vérifier si l'utilisateur est toujours valide
      if (!user.uid) {
        logger.warn({
          category: "Auth",
          message:
            "Tentative de rafraîchissement de token pour un utilisateur non valide",
        });
        return;
      }

      // Rafraîchir le token immédiatement
      try {
        const token = await user.getIdToken(true);
        logger.info({
          category: "Auth",
          message: "Token initial obtenu avec succès",
          data: { tokenLength: token.length },
        });
      } catch (error) {
        logger.error({
          category: "Auth",
          message: "Échec de l'obtention du token initial",
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error; // Propager l'erreur pour éviter de configurer un intervalle qui échouera
      }

      // Configurer un nouvel intervalle avec une fonction de rafraîchissement robuste
      const intervalId = window.setInterval(async () => {
        try {
          // Vérifier si l'utilisateur est toujours connecté
          const currentUser = this.auth.currentUser;
          if (!currentUser || currentUser.uid !== user.uid) {
            logger.warn({
              category: "Auth",
              message:
                "Utilisateur déconnecté, arrêt du rafraîchissement du token",
            });
            this.clearTokenRefreshInterval(user.uid);
            return;
          }

          const token = await user.getIdToken(true);
          logger.info({
            category: "Auth",
            message: "Token rafraîchi avec succès",
            data: { tokenLength: token.length },
          });
        } catch (error) {
          logger.error({
            category: "Auth",
            message: "Échec du rafraîchissement du token",
            error: error instanceof Error ? error : new Error(String(error)),
          });

          // Analyser l'erreur pour déterminer si nous devons arrêter les tentatives
          const authError = error as FirebaseAuthError;
          if (
            authError.code === "auth/id-token-expired" ||
            authError.code === "auth/user-disabled" ||
            authError.code === "auth/user-token-expired" ||
            authError.code === "auth/user-not-found"
          ) {
            logger.warn({
              category: "Auth",
              message:
                "Arrêt du rafraîchissement du token en raison d'une erreur critique",
              data: { code: authError.code },
            });
            this.clearTokenRefreshInterval(user.uid);

            // Forcer la déconnexion si l'utilisateur n'est plus valide
            this.logout().catch((e) => {
              logger.error({
                category: "Auth",
                message: "Échec de la déconnexion forcée après erreur de token",
                error: e instanceof Error ? e : new Error(String(e)),
              });
            });
          }
        }
      }, this.options.tokenRefreshInterval);

      // Stocker l'ID de l'intervalle pour pouvoir le nettoyer plus tard
      this.tokenRefreshIntervals.set(user.uid, intervalId);
      logger.info({
        category: "Auth",
        message: "Rafraîchissement de token configuré avec succès",
        data: { userId: user.uid },
      });
    } catch (error) {
      logger.error({
        category: "Auth",
        message: "Échec de la configuration du rafraîchissement du token",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Annule le rafraîchissement du token
   */
  protected clearTokenRefresh(): void {
    this.clearAllTokenRefreshIntervals();
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

  /**
   * S'abonne aux changements d'état d'authentification
   */
  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.auth.onAuthStateChanged(callback);
  }

  private handleAuthError(error: Error): void {
    logger.error({
      category: "Auth",
      message: "Erreur de changement d'état d'authentification",
      error,
    });
  }
}

// Exporter l'instance singleton
export const firebaseAuthService = FirebaseAuthService.getInstance();
