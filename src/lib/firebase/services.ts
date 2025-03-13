import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Functions, getFunctions } from "firebase/functions";
import { logger } from "../../core/logger";
import { app } from "../../config/firebase";

const LOG_CATEGORY = "FirebaseManager";

export class FirebaseManager {
  private static instance: FirebaseManager;
  private readonly app: FirebaseApp;
  private _auth: Auth | null = null;
  private _db: Firestore;
  private _functions: Functions;

  private constructor() {
    logger.info({
      category: LOG_CATEGORY,
      message: "🚀 Démarrage de l'initialisation de Firebase",
    });

    try {
      // Utiliser l'instance Firebase déjà initialisée
      this.app = app;

      // Initialiser Firestore
      logger.debug({
        category: LOG_CATEGORY,
        message: "📚 Initialisation de Firestore",
      });
      this._db = getFirestore(this.app);
      logger.info({
        category: LOG_CATEGORY,
        message: "✅ Service Firestore initialisé",
      });

      // Initialiser Functions
      logger.debug({
        category: LOG_CATEGORY,
        message: "⚡ Initialisation des Functions",
      });
      this._functions = getFunctions(
        this.app,
        import.meta.env.VITE_FIREBASE_REGION
      );
      logger.info({
        category: LOG_CATEGORY,
        message: "✅ Service Functions initialisé",
      });

      logger.info({
        category: LOG_CATEGORY,
        message: "🎉 Services Firebase de base initialisés",
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: "❌ Erreur lors de l'initialisation de Firebase",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  public static async getInstanceAsync(): Promise<FirebaseManager> {
    if (!FirebaseManager.instance) {
      logger.info({
        category: LOG_CATEGORY,
        message: "🏗️ Création d'une nouvelle instance FirebaseManager",
      });
      FirebaseManager.instance = new FirebaseManager();
    }
    return FirebaseManager.instance;
  }

  /**
   * Initialise Auth directement et retourne l'instance, sans dépendre du getter
   * Cette méthode permet de briser la dépendance circulaire
   */
  public async initAuth(): Promise<Auth> {
    try {
      if (!this._auth) {
        logger.debug({
          category: LOG_CATEGORY,
          message: "🔐 Initialisation de Firebase Auth via initAuth()",
        });

        // Initialiser explicitement Auth
        const { getAuth } = await import("firebase/auth");
        this._auth = getAuth(this.app);

        logger.info({
          category: LOG_CATEGORY,
          message: "✅ Service Auth correctement initialisé via initAuth()",
        });
      }

      return this._auth as Auth;
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message:
          "❌ Erreur critique lors de l'initialisation de Auth via initAuth()",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Vérifie si Auth est initialisé
   */
  public isAuthInitialized(): boolean {
    return this._auth !== null;
  }

  get auth(): Auth {
    if (!this.isAuthInitialized()) {
      throw new Error(
        "Firebase Auth n'est pas encore initialisé. Assurez-vous d'avoir appelé getInstanceAsync()."
      );
    }
    return this._auth as Auth; // Cast sûr car on a vérifié avec isAuthInitialized
  }

  get db(): Firestore {
    return this._db;
  }

  get functions(): Functions {
    return this._functions;
  }
}

// Export une fonction asynchrone pour obtenir l'instance
export async function getFirebaseManager(): Promise<FirebaseManager> {
  return FirebaseManager.getInstanceAsync();
}
