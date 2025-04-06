type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMessage {
  message: string;
  category?: string;
  error?: Error | unknown;
  data?: Record<string, any>;
  [key: string]: any;
}

class FirebaseLogger {
  private static instance: FirebaseLogger;
  private logLevel: LogLevel = "info"; // Niveau de log par défaut
  private isProduction: boolean = process.env.NODE_ENV === "production";

  private constructor() {}

  static getInstance(): FirebaseLogger {
    if (!this.instance) {
      this.instance = new FirebaseLogger();
    }
    return this.instance;
  }

  /**
   * Configure le niveau de log
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Transforme un objet d'erreur en objet JSON sérialisable
   */
  private formatError(error: unknown): Record<string, any> {
    if (!error) return { message: "Unknown error" };

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause ? this.formatError(error.cause) : undefined,
      };
    }

    // Si ce n'est pas une Error mais un objet
    if (typeof error === "object" && error !== null) {
      try {
        // Tentative de conversion en objet sérialisable
        return JSON.parse(JSON.stringify(error));
      } catch (e) {
        return { serializedError: String(error) };
      }
    }

    // Si c'est une primitive
    return { serializedError: String(error) };
  }

  /**
   * Formate un message de log
   */
  private formatLogMessage(
    entry: LogMessage | string,
    level: LogLevel
  ): Record<string, any> {
    const timestamp = new Date().toISOString();

    // Si entry est une chaîne, la convertir en objet LogMessage
    if (typeof entry === "string") {
      entry = { message: entry };
    }

    const category = entry.category || "App";

    // Extraire le message et supprimer la propriété pour éviter la duplication
    const message = entry.message;

    // S'assurer que le message est toujours une chaîne de caractères
    const safeMessage =
      typeof message === "string"
        ? message
        : message === undefined
        ? "Undefined message"
        : String(message);

    // Extraire l'erreur et les autres propriétés
    const error = entry.error;
    const { message: _, error: __, ...restProps } = entry;

    // Transformer l'erreur en objet sérialisable si présente
    const formattedError = error ? this.formatError(error) : undefined;

    // Construire l'objet de log final
    return {
      timestamp,
      level,
      category,
      message: safeMessage,
      ...(formattedError ? { error: formattedError } : {}),
      ...restProps,
    };
  }

  /**
   * Détermine si un niveau de log doit être affiché
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  debug(entry: LogMessage | string): void {
    if (!this.shouldLog("debug")) return;

    const formattedEntry =
      typeof entry === "string"
        ? this.formatLogMessage({ message: entry }, "debug")
        : this.formatLogMessage(entry, "debug");

    console.debug(`[DEBUG] ${formattedEntry.category}`, formattedEntry);
  }

  info(entry: LogMessage | string): void {
    if (!this.shouldLog("info")) return;

    const formattedEntry =
      typeof entry === "string"
        ? this.formatLogMessage({ message: entry }, "info")
        : this.formatLogMessage(entry, "info");

    console.info(`[INFO] ${formattedEntry.category}`, formattedEntry);
  }

  warn(entry: LogMessage | string): void {
    if (!this.shouldLog("warn")) return;

    const formattedEntry =
      typeof entry === "string"
        ? this.formatLogMessage({ message: entry }, "warn")
        : this.formatLogMessage(entry, "warn");

    console.warn(`[WARN] ${formattedEntry.category}`, formattedEntry);
  }

  error(entry: LogMessage | string): void {
    if (!this.shouldLog("error")) return;

    const formattedEntry =
      typeof entry === "string"
        ? this.formatLogMessage({ message: entry }, "error")
        : this.formatLogMessage(entry, "error");

    console.error(`[ERROR] ${formattedEntry.category}`, formattedEntry);

    // En production, on pourrait envoyer les erreurs à un service comme Sentry
    if (this.isProduction) {
      // Code pour envoyer à un service de monitoring comme Sentry
      // Exemple: Sentry.captureException(formattedEntry.error);
    }
  }

  /**
   * Log un événement métier important
   */
  logEvent(eventName: string, data?: Record<string, any>): void {
    this.info({
      category: "Event",
      message: eventName,
      data,
    });

    // En production, on pourrait envoyer à Analytics
    if (this.isProduction) {
      // Code pour envoyer à un service d'analytics
      // Exemple: Analytics.logEvent(eventName, data);
    }
  }
}

export const logger = FirebaseLogger.getInstance();
