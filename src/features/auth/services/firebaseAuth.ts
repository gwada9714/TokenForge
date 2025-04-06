import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
  Auth,
  onAuthStateChanged,
  Unsubscribe,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { logger } from "@/core/logger";

const LOG_CATEGORY = "FirebaseAuth";

/**
 * Service d'authentification Firebase
 * @deprecated Cette classe est maintenue pour compatibilité. Utiliser le service authService de @/lib/firebase/auth-service
 */
class FirebaseAuth {
  private static instance: FirebaseAuth;
  private auth: Auth | null = null;
  private authUnsubscribe: Unsubscribe | null = null;
  private authInitialized = false;
  private initializing = false;

  private constructor() {
    logger.info({
      category: LOG_CATEGORY,
      message: "Service FirebaseAuth initialisé",
      data: { deprecated: true },
    });

    // L'initialisation est maintenant asynchrone et gérée par ensureAuth()
  }

  public static getInstance(): FirebaseAuth {
    if (!FirebaseAuth.instance) {
      FirebaseAuth.instance = new FirebaseAuth();
    }
    return FirebaseAuth.instance;
  }

  /**
   * S'assure que l'authentification Firebase est initialisée
   * @returns Une promesse résolue avec l'instance Auth
   */
  private async ensureAuth(): Promise<Auth> {
    // Si déjà initialisé, retourner directement
    if (this.auth && this.authInitialized) {
      return this.auth;
    }

    // Si en cours d'initialisation, attendre
    if (this.initializing) {
      logger.debug({
        category: LOG_CATEGORY,
        message: "Attente de l'initialisation de Firebase Auth en cours",
      });

      // Attendre que l'initialisation se termine
      await new Promise((resolve) => {
        const checkInitialized = () => {
          if (this.authInitialized) {
            resolve(true);
            return;
          }
          setTimeout(checkInitialized, 100);
        };
        checkInitialized();
      });

      return this.auth!;
    }

    // Sinon, initialiser
    try {
      this.initializing = true;

      logger.info({
        category: LOG_CATEGORY,
        message: "Initialisation de Firebase Auth via getFirebaseAuth()",
      });

      // Utiliser la version asynchrone de getFirebaseAuth
      this.auth = await getFirebaseAuth();
      this.authInitialized = true;

      logger.info({
        category: LOG_CATEGORY,
        message: "Firebase Auth initialisé avec succès",
      });

      return this.auth;
    } catch (error) {
      this.authInitialized = false;
      logger.error({
        category: LOG_CATEGORY,
        message: "Échec de l'initialisation de Firebase Auth",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Nettoie les ressources et écouteurs d'événements
   */
  async cleanup(): Promise<void> {
    if (this.authUnsubscribe) {
      logger.debug({
        category: LOG_CATEGORY,
        message: "Nettoyage des écouteurs d'authentification",
      });

      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
  }

  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<User> {
    try {
      const auth = await this.ensureAuth();

      logger.info({
        category: LOG_CATEGORY,
        message: "Tentative de connexion avec email/mot de passe",
        data: { emailProvided: !!email },
      });

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      logger.info({
        category: LOG_CATEGORY,
        message: "Connexion réussie avec email/mot de passe",
        data: { userId: userCredential.user.uid },
      });

      return userCredential.user;
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: "Échec de connexion avec email/mot de passe",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw error;
    }
  }

  async createAccount(email: string, password: string): Promise<User> {
    try {
      const auth = await this.ensureAuth();

      logger.info({
        category: LOG_CATEGORY,
        message: "Tentative de création de compte",
        data: { emailProvided: !!email },
      });

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      logger.info({
        category: LOG_CATEGORY,
        message: "Création de compte réussie",
        data: { userId: userCredential.user.uid },
      });

      return userCredential.user;
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: "Échec de création de compte",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const auth = await this.ensureAuth();

      logger.info({
        category: LOG_CATEGORY,
        message:
          "Tentative d'envoi d'email de réinitialisation de mot de passe",
        data: { emailProvided: !!email },
      });

      await sendPasswordResetEmail(auth, email);

      logger.info({
        category: LOG_CATEGORY,
        message: "Email de réinitialisation de mot de passe envoyé avec succès",
        data: { emailProvided: !!email },
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: "Échec d'envoi d'email de réinitialisation de mot de passe",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw error;
    }
  }

  async sendVerificationEmail(user: User): Promise<void> {
    try {
      logger.info({
        category: LOG_CATEGORY,
        message: "Tentative d'envoi d'email de vérification",
        data: { userId: user.uid },
      });

      await sendEmailVerification(user);

      logger.info({
        category: LOG_CATEGORY,
        message: "Email de vérification envoyé avec succès",
        data: { userId: user.uid },
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: "Échec d'envoi d'email de vérification",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw error;
    }
  }

  async updateUserProfile(
    user: User,
    displayName: string,
    photoURL?: string
  ): Promise<void> {
    try {
      logger.info({
        category: LOG_CATEGORY,
        message: "Mise à jour du profil utilisateur",
        data: {
          userId: user.uid,
          hasDisplayName: !!displayName,
          hasPhotoUrl: !!photoURL,
        },
      });

      await updateProfile(user, { displayName, photoURL: photoURL || null });

      logger.info({
        category: LOG_CATEGORY,
        message: "Profil utilisateur mis à jour avec succès",
        data: { userId: user.uid },
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: "Échec de mise à jour du profil utilisateur",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const auth = await this.ensureAuth();

      logger.info({
        category: LOG_CATEGORY,
        message: "Tentative de déconnexion",
      });

      // Nettoyer les écouteurs avant la déconnexion
      await this.cleanup();

      await signOut(auth);

      logger.info({
        category: LOG_CATEGORY,
        message: "Déconnexion réussie",
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: "Erreur lors de la déconnexion",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw error;
    }
  }

  // Alias pour maintenir la compatibilité avec les appels existants
  async signOut(): Promise<void> {
    return this.logout();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    return this.resetPassword(email);
  }

  async updateProfile(displayName: string, photoURL?: string): Promise<void> {
    try {
      const auth = await this.ensureAuth();

      if (!auth.currentUser) {
        throw new Error("Aucun utilisateur connecté");
      }

      logger.info({
        category: LOG_CATEGORY,
        message: "Mise à jour du profil utilisateur",
        data: {
          userId: auth.currentUser.uid,
          hasDisplayName: !!displayName,
          hasPhotoUrl: !!photoURL,
        },
      });

      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: photoURL || null,
      });

      logger.info({
        category: LOG_CATEGORY,
        message: "Profil utilisateur mis à jour avec succès",
        data: { userId: auth.currentUser.uid },
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: "Échec de mise à jour du profil utilisateur",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    try {
      this.ensureAuth()
        .then((auth) => {
          logger.debug({
            category: LOG_CATEGORY,
            message:
              "Mise en place de l'écoute des changements d'état d'authentification",
          });

          // Nettoyer l'ancienne souscription si elle existe
          if (this.authUnsubscribe) {
            this.authUnsubscribe();
          }

          // Établir la nouvelle souscription
          this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
            try {
              callback(user);
            } catch (callbackError) {
              logger.error({
                category: LOG_CATEGORY,
                message: "Erreur dans le callback onAuthStateChanged",
                error:
                  callbackError instanceof Error
                    ? callbackError
                    : new Error(String(callbackError)),
              });
            }
          });

          logger.debug({
            category: LOG_CATEGORY,
            message:
              "Écoute des changements d'état d'authentification configurée avec succès",
          });
        })
        .catch((error) => {
          logger.error({
            category: LOG_CATEGORY,
            message:
              "Impossible d'écouter les changements d'état d'authentification",
            error: error instanceof Error ? error : new Error(String(error)),
          });
        });

      // Retourner une fonction qui nettoie l'écouteur
      return () => {
        if (this.authUnsubscribe) {
          this.authUnsubscribe();
          this.authUnsubscribe = null;
        }
      };
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message:
          "Erreur lors de la configuration de l'écoute des changements d'état d'authentification",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Retourner une fonction de désabonnement vide en cas d'erreur
      return () => {};
    }
  }
}

export const firebaseAuth = FirebaseAuth.getInstance();
