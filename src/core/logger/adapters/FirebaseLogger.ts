import { LogAdapter, LogEntry, LogLevel } from "../types";

/**
 * Adaptateur pour le logging dans Firebase
 *
 * Cette classe s'intègre avec les services Firebase suivant l'organisation modulaire:
 * - src/lib/firebase/services.ts : Initialisation cœur
 * - src/lib/firebase/auth.ts : Gestion authentification
 * - src/lib/firebase/firestore.ts : Interactions base de données
 */
export class FirebaseLogger implements LogAdapter {
  // Flag pour éviter des initialisations multiples
  private initialized: boolean = false;

  // Référence Firebase Analytics (chargé de manière paresseuse)
  private analytics: any = null;

  constructor() {
    this.lazyInitialize();
  }

  /**
   * Initialisation tardive des services Firebase
   * Cela permet d'éviter les dépendances circulaires
   */
  private async lazyInitialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Import dynamique du service Firebase principal
      const firebaseService = await import("../../../lib/firebase/services");

      // Si Firebase Analytics est disponible, l'initialiser
      if (firebaseService && firebaseService.app) {
        try {
          const { getAnalytics } = await import("firebase/analytics");
          this.analytics = getAnalytics(firebaseService.app);
        } catch (e) {
          console.warn("Firebase Analytics n'est pas disponible", e);
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error("Erreur lors de l'initialisation du FirebaseLogger", error);
    }
  }

  /**
   * Conversion d'un objet Error en objet sérialisable
   */
  private serializeError(error: Error): Record<string, any> {
    if (!error) return {};

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  /**
   * Enregistre un log dans Firebase
   */
  async log(entry: LogEntry): Promise<void> {
    // Attendre l'initialisation si nécessaire
    if (!this.initialized) {
      await this.lazyInitialize();
    }

    // Préparer les données de log
    const logData = {
      timestamp: entry.timestamp,
      level: entry.level,
      category: entry.category,
      message: entry.message,
      data: entry.data || null,
      error: entry.error ? this.serializeError(entry.error) : null,
    };

    // Envoyer à Firebase Analytics pour les événements importants
    if (
      this.analytics &&
      (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL)
    ) {
      try {
        const { logEvent } = await import("firebase/analytics");
        logEvent(this.analytics, `log_${entry.level}`, {
          category: entry.category,
          message: entry.message,
        });
      } catch (e) {
        // Silencieux en cas d'échec de l'analytique
      }
    }

    // Possibilité d'envoyer à Firestore pour des logs persistants
    // Cette fonctionnalité pourrait être ajoutée ultérieurement
  }
}
