import * as admin from "firebase-admin";
import { logger } from "../core/logger";

/**
 * Initialise Firebase Admin SDK en utilisant les variables d'environnement
 * ou un fichier de service account si spécifié.
 */
function initializeFirebaseAdmin() {
  try {
    // Vérifier si les variables d'environnement sont disponibles
    if (
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    ) {
      // Utiliser les variables d'environnement
      const serviceAccount = {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        ),
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL:
          process.env.FIREBASE_ADMIN_DATABASE_URL ||
          `https://${serviceAccount.projectId}.firebaseio.com`,
      });

      logger.info({
        category: "FirebaseAdmin",
        message: "Firebase Admin initialisé avec les variables d'environnement",
        data: { projectId: serviceAccount.projectId },
      });
    }
    // Sinon, essayer d'utiliser un fichier de service account
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL:
          process.env.FIREBASE_ADMIN_DATABASE_URL ||
          `https://${serviceAccount.project_id}.firebaseio.com`,
      });

      logger.info({
        category: "FirebaseAdmin",
        message: "Firebase Admin initialisé avec le fichier de service account",
        data: { projectId: serviceAccount.project_id },
      });
    }
    // Sinon, en mode développement, utiliser des valeurs par défaut
    else if (process.env.NODE_ENV === "development") {
      logger.warn({
        category: "FirebaseAdmin",
        message:
          "Firebase Admin initialisé en mode développement avec des valeurs par défaut",
        data: { mode: "development" },
      });

      // En développement, on peut utiliser l'émulateur Firebase
      admin.initializeApp({
        projectId: "tokenforge-dev",
      });
    }
    // Sinon, lever une erreur
    else {
      throw new Error(
        "Configuration Firebase Admin manquante. Veuillez définir les variables d'environnement nécessaires."
      );
    }
  } catch (error) {
    logger.error({
      category: "FirebaseAdmin",
      message: "Erreur lors de l'initialisation de Firebase Admin",
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

// Initialiser Firebase Admin
initializeFirebaseAdmin();

export default admin;
