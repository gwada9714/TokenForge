/**
 * @deprecated - Ce fichier est déprécié et sera supprimé dans une version future.
 * Utilisez src/lib/firebase/services.ts pour l'initialisation de Firebase.
 */

import { logger } from "@/core/logger";
import { getFirebaseManager } from "./services";
import { BaseService } from "@/core/services/BaseService";

export class FirebaseInitializer extends BaseService {
  private static instance: FirebaseInitializer;

  private constructor() {
    super("FirebaseInitializer");
    logger.warn({
      category: "FirebaseInitializer",
      message:
        "FirebaseInitializer est déprécié. Utilisez getFirebaseManager de services.ts",
    });
  }

  static getInstance(): FirebaseInitializer {
    if (!FirebaseInitializer.instance) {
      FirebaseInitializer.instance = new FirebaseInitializer();
    }
    return FirebaseInitializer.instance;
  }

  async initialize(): Promise<void> {
    try {
      logger.warn({
        category: "FirebaseInitializer",
        message:
          "Utilisation de la méthode dépréciée initialize(). Redirection vers getFirebaseManager",
      });

      // Utiliser getFirebaseManager pour assurer la compatibilité
      await getFirebaseManager();

      logger.info({
        category: "Firebase",
        message: "Firebase initialized via getFirebaseManager",
      });
    } catch (error) {
      logger.error({
        category: "Firebase",
        message: "Firebase initialization failed",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Implémentation de la méthode abstraite cleanup de BaseService
   * @deprecated - Cette méthode est dépréciée. Utilisez getFirebaseManager de services.ts
   */
  async cleanup(): Promise<void> {
    logger.warn({
      category: "FirebaseInitializer",
      message: "Méthode cleanup() dépréciée appelée",
    });
    // Pas de nettoyage spécifique nécessaire pour Firebase
    return Promise.resolve();
  }
}

export const firebaseInitializer = FirebaseInitializer.getInstance();
