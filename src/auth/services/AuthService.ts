import {
  Auth,
  getAuth,
  User,
  signInWithEmailAndPassword,
  signOut,
  AuthErrorCodes,
} from "firebase/auth";
import { app, firebaseService } from "@/config/firebase/index";
import { logger } from "@/core/logger";
import type {
  LoginCredentials,
  AuthResponse,
  AuthError,
} from "../types/auth.types";

export class AuthService {
  private static instance: AuthService;
  private auth: Auth;
  private readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes
  private tokenRefreshIntervals: Map<string, number> = new Map();

  private constructor() {
    this.auth = getAuth(app);
    this.setupAuthListeners();

    // Vérifier si l'utilisateur est déjà connecté au démarrage
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.setupTokenRefresh(currentUser).catch((error) => {
        logger.error(
          "Auth",
          "Erreur lors de la configuration du rafraîchissement du token au démarrage",
          error
        );
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
      await this.setupTokenRefresh(user);
    } else {
      // Nettoyer les intervalles existants lors de la déconnexion
      this.clearAllTokenRefreshIntervals();
    }
  }

  private async setupTokenRefresh(user: User): Promise<void> {
    try {
      // Nettoyer tout intervalle existant pour cet utilisateur
      this.clearTokenRefreshInterval(user.uid);

      // Vérifier si l'utilisateur est toujours valide
      if (!user.uid) {
        logger.warn(
          "Auth",
          "Tentative de rafraîchissement de token pour un utilisateur non valide"
        );
        return;
      }

      // Rafraîchir le token immédiatement
      try {
        const token = await user.getIdToken(true);
        logger.info("Auth", "Token initial obtenu avec succès", {
          tokenLength: token.length,
        });
      } catch (error) {
        logger.error("Auth", "Échec de l'obtention du token initial", error);
        throw error; // Propager l'erreur pour éviter de configurer un intervalle qui échouera
      }

      // Configurer un nouvel intervalle avec une fonction de rafraîchissement robuste
      const intervalId = window.setInterval(async () => {
        try {
          // Vérifier si l'utilisateur est toujours connecté
          const currentUser = this.auth.currentUser;
          if (!currentUser || currentUser.uid !== user.uid) {
            logger.warn(
              "Auth",
              "Utilisateur déconnecté, arrêt du rafraîchissement du token"
            );
            this.clearTokenRefreshInterval(user.uid);
            return;
          }

          const token = await user.getIdToken(true);
          logger.info("Auth", "Token rafraîchi avec succès", {
            tokenLength: token.length,
          });
        } catch (error) {
          logger.error("Auth", "Échec du rafraîchissement du token", error);

          // Analyser l'erreur pour déterminer si nous devons arrêter les tentatives
          const authError = error as AuthError;
          if (
            authError.code === AuthErrorCodes.TOKEN_EXPIRED ||
            authError.code === AuthErrorCodes.USER_DISABLED ||
            authError.code === AuthErrorCodes.USER_DELETED
          ) {
            logger.warn(
              "Auth",
              "Arrêt du rafraîchissement du token en raison d'une erreur critique",
              { code: authError.code }
            );
            this.clearTokenRefreshInterval(user.uid);

            // Forcer la déconnexion si l'utilisateur n'est plus valide
            this.logout().catch((e) => {
              logger.error(
                "Auth",
                "Échec de la déconnexion forcée après erreur de token",
                e
              );
            });
          }
        }
      }, this.TOKEN_REFRESH_INTERVAL);

      // Stocker l'ID de l'intervalle pour pouvoir le nettoyer plus tard
      this.tokenRefreshIntervals.set(user.uid, intervalId);
      logger.info("Auth", "Rafraîchissement de token configuré avec succès", {
        userId: user.uid,
      });
    } catch (error) {
      logger.error(
        "Auth",
        "Échec de la configuration du rafraîchissement du token",
        error
      );
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
    logger.error(
      "Auth",
      "Erreur de changement d'état d'authentification",
      error
    );
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // S'assurer que Firebase est initialisé
      if (!firebaseService.isInitialized()) {
        await firebaseService.initialize();
      }

      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // Configurer le rafraîchissement du token après la connexion
      await this.setupTokenRefresh(userCredential.user);

      logger.info("Auth", "Utilisateur connecté avec succès", {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      });

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      const authError = error as AuthError;
      logger.error("Auth", "Échec de connexion", error);

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
        error: {
          ...authError,
          message: errorMessage,
        },
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Nettoyer les intervalles avant la déconnexion
      this.clearAllTokenRefreshIntervals();

      // Vérifier si l'utilisateur est connecté avant de tenter la déconnexion
      if (this.auth.currentUser) {
        await signOut(this.auth);
        logger.info("Auth", "Déconnexion réussie");
      } else {
        logger.info("Auth", "Déconnexion ignorée - aucun utilisateur connecté");
      }
    } catch (error) {
      logger.error("Auth", "Échec de déconnexion", error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.auth.onAuthStateChanged(callback);
  }
}

export const authService = AuthService.getInstance();
