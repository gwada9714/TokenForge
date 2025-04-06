import {
  signInAnonymously,
  User,
  onAuthStateChanged,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { logger } from "../../core/logger";
import { getFirebaseManager } from "./services";
import { handleFirebaseError } from "../../utils/error-handler";

export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private auth: Auth | null = null;
  private currentUser: User | null = null;
  private initialized = false;
  private authStateListener: (() => void) | null = null;

  private constructor() {
    logger.info({
      category: "FirebaseAuth",
      message: "Service d'authentification en cours d'initialisation",
    });
  }

  public static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  /**
   * Initialise la connexion à Auth Firebase
   */
  private async ensureInitialized(): Promise<Auth> {
    if (!this.auth) {
      try {
        const firebaseManager = await getFirebaseManager();

        // Utiliser la méthode initAuth() pour initialiser Auth directement
        // Cette approche évite les dépendances circulaires
        this.auth = await firebaseManager.initAuth();

        // Configurer l'écouteur d'état d'authentification
        this.setupAuthStateListener();

        logger.info({
          category: "FirebaseAuth",
          message: "Service d'authentification initialisé via FirebaseManager",
        });
        this.initialized = true;
      } catch (error) {
        logger.error({
          category: "FirebaseAuth",
          message:
            "Erreur lors de l'initialisation du service d'authentification",
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }
    }
    return this.auth;
  }

  /**
   * Configure l'écouteur de changements d'état d'authentification
   */
  private setupAuthStateListener(): void {
    // N'exécuter cette méthode que si auth est initialisé et qu'aucun écouteur n'est actif
    if (!this.auth || this.authStateListener !== null) {
      return;
    }

    // Écouter les changements d'état d'authentification
    this.authStateListener = onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;

      if (user) {
        logger.info({
          category: "FirebaseAuth",
          message: "Utilisateur authentifié",
          data: {
            uid: user.uid,
            isAnonymous: user.isAnonymous,
            emailVerified: user.emailVerified,
          },
        });
      } else {
        logger.info({
          category: "FirebaseAuth",
          message: "Utilisateur déconnecté",
        });
      }
    });
  }

  /**
   * Nettoie l'écouteur d'authentification
   */
  private cleanupAuthStateListener(): void {
    if (this.authStateListener) {
      this.authStateListener();
      this.authStateListener = null;
    }
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Authentification avec email et mot de passe
   */
  public async signIn(email: string, password: string): Promise<User> {
    try {
      logger.info({
        category: "FirebaseAuth",
        message: "Tentative de connexion avec email",
        data: { emailProvided: !!email },
      });

      const auth = await this.ensureInitialized();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      logger.info({
        category: "FirebaseAuth",
        message: "Connexion réussie",
        data: { userId: userCredential.user.uid },
      });

      return userCredential.user;
    } catch (error) {
      logger.error({
        category: "FirebaseAuth",
        message: "Échec de connexion",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw handleFirebaseError(error);
    }
  }

  /**
   * Création d'un nouveau compte utilisateur
   */
  public async signUp(email: string, password: string): Promise<User> {
    try {
      logger.info({
        category: "FirebaseAuth",
        message: "Tentative de création de compte",
        data: { emailProvided: !!email },
      });

      const auth = await this.ensureInitialized();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      logger.info({
        category: "FirebaseAuth",
        message: "Création de compte réussie",
        data: { userId: userCredential.user.uid },
      });

      return userCredential.user;
    } catch (error) {
      logger.error({
        category: "FirebaseAuth",
        message: "Échec de création de compte",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw handleFirebaseError(error);
    }
  }

  /**
   * Authentification anonyme
   */
  public async signInAnonymously(): Promise<User> {
    try {
      logger.info({
        category: "FirebaseAuth",
        message: "Tentative d'authentification anonyme",
      });

      const auth = await this.ensureInitialized();
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      logger.error({
        category: "FirebaseAuth",
        message: "Erreur lors de l'authentification anonyme",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Réessayer une fois en cas d'erreur
      try {
        logger.info({
          category: "FirebaseAuth",
          message: "Nouvelle tentative d'authentification anonyme",
        });

        const auth = await this.ensureInitialized();
        const result = await signInAnonymously(auth);
        return result.user;
      } catch (retryError) {
        logger.error({
          category: "FirebaseAuth",
          message: "Échec de la nouvelle tentative d'authentification anonyme",
          error:
            retryError instanceof Error
              ? retryError
              : new Error(String(retryError)),
        });
        throw handleFirebaseError(retryError);
      }
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  public async signOut(): Promise<void> {
    try {
      logger.info({
        category: "FirebaseAuth",
        message: "Tentative de déconnexion",
      });

      const auth = await this.ensureInitialized();
      await auth.signOut();

      // Nettoyer l'écouteur d'authentification après la déconnexion
      this.cleanupAuthStateListener();

      logger.info({
        category: "FirebaseAuth",
        message: "Déconnexion réussie",
      });
    } catch (error) {
      logger.error({
        category: "FirebaseAuth",
        message: "Erreur lors de la déconnexion",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw handleFirebaseError(error);
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  public async resetPassword(email: string): Promise<void> {
    try {
      logger.info({
        category: "FirebaseAuth",
        message: "Tentative de réinitialisation de mot de passe",
        data: { emailProvided: !!email },
      });

      const auth = await this.ensureInitialized();
      await sendPasswordResetEmail(auth, email);

      logger.info({
        category: "FirebaseAuth",
        message: "Email de réinitialisation envoyé avec succès",
        data: { emailProvided: !!email },
      });
    } catch (error) {
      logger.error({
        category: "FirebaseAuth",
        message: "Échec de réinitialisation de mot de passe",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw handleFirebaseError(error);
    }
  }

  /**
   * Mise à jour du profil utilisateur
   */
  public async updateProfile(profileData: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      const { displayName, photoURL } = profileData;

      logger.info({
        category: "FirebaseAuth",
        message: "Tentative de mise à jour du profil utilisateur",
        data: { hasDisplayName: !!displayName, hasPhotoURL: !!photoURL },
      });

      const auth = await this.ensureInitialized();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Aucun utilisateur connecté");
      }

      await updateProfile(currentUser, {
        displayName: displayName || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL,
      });

      logger.info({
        category: "FirebaseAuth",
        message: "Profil utilisateur mis à jour avec succès",
        data: { userId: currentUser.uid },
      });
    } catch (error) {
      logger.error({
        category: "FirebaseAuth",
        message: "Échec de mise à jour du profil utilisateur",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw handleFirebaseError(error);
    }
  }

  /**
   * Obtenir l'instance Auth
   */
  public async getAuth(): Promise<Auth> {
    return this.ensureInitialized();
  }

  /**
   * Vérifier si le service est initialisé
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

export const firebaseAuth = FirebaseAuthService.getInstance();

/**
 * Initialise le service d'authentification Firebase
 */
export async function initializeAuth(): Promise<void> {
  const authService = FirebaseAuthService.getInstance();
  await authService.getAuth(); // Cela va initialiser le service si nécessaire
  logger.info({
    category: "FirebaseAuth",
    message: "Service d'authentification Firebase initialisé",
  });
  return Promise.resolve();
}

/**
 * Récupère l'instance Auth de Firebase
 */
export async function getFirebaseAuth(): Promise<Auth> {
  return firebaseAuth.getAuth();
}
