import * as Sentry from "@sentry/react";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  enableConsole?: boolean;
  enableSentry?: boolean;
  enableFirebase?: boolean;
}

class Logger {
  private static instance: Logger;
  private options: LoggerOptions = {
    minLevel: LogLevel.DEBUG,
    enableConsole: true,
    enableSentry: import.meta.env.VITE_ERROR_REPORTING_ENABLED === "true",
    enableFirebase: import.meta.env.VITE_FIREBASE_LOGGING_ENABLED === "true",
  };

  private logHistory: LogEntry[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public configure(options: LoggerOptions): void {
    this.options = { ...this.options, ...options };
  }

  public debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  public info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  public warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  public error(
    category: string,
    message: string,
    error?: any,
    data?: any
  ): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  public fatal(
    category: string,
    message: string,
    error?: any,
    data?: any
  ): void {
    this.log(LogLevel.FATAL, category, message, data, error);
  }

  public log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: any
  ): void {
    // Vérifier le niveau minimum de log
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      error:
        error instanceof Error
          ? error
          : error
          ? new Error(String(error))
          : undefined,
    };

    // Ajouter à l'historique
    this.addToHistory(entry);

    // Console logging
    if (this.options.enableConsole) {
      this.logToConsole(entry);
    }

    // Sentry logging pour les erreurs
    if (
      this.options.enableSentry &&
      (level === LogLevel.ERROR || level === LogLevel.FATAL)
    ) {
      this.logToSentry(entry);
    }

    // Firebase logging (à implémenter si nécessaire)
    if (this.options.enableFirebase) {
      this.logToFirebase(entry);
    }
  }

  public getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  public clearHistory(): void {
    this.logHistory = [];
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL,
    ];
    const minLevelIndex = levels.indexOf(
      this.options.minLevel || LogLevel.DEBUG
    );
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex >= minLevelIndex;
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);

    // Limiter la taille de l'historique
    if (this.logHistory.length > this.MAX_HISTORY_SIZE) {
      this.logHistory = this.logHistory.slice(-this.MAX_HISTORY_SIZE);
    }

    // Optionnellement, sauvegarder dans localStorage
    try {
      const serializedHistory = JSON.stringify(this.logHistory.slice(-100));
      localStorage.setItem("tokenforge_log_history", serializedHistory);
    } catch (e) {
      console.error("Failed to save logs to localStorage", e);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { level, category, message, data, error } = entry;
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data || "", error || "");
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data || "", error || "");
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data || "", error || "");
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, message, data || "", error || "");
        break;
    }
  }

  private logToSentry(entry: LogEntry): void {
    try {
      if (entry.error) {
        Sentry.captureException(entry.error, {
          level: entry.level === LogLevel.FATAL ? "fatal" : "error",
          tags: { category: entry.category },
          extra: {
            message: entry.message,
            data: entry.data,
            timestamp: entry.timestamp,
          },
        });
      } else {
        Sentry.captureMessage(entry.message, {
          level: entry.level === LogLevel.FATAL ? "fatal" : "error",
          tags: { category: entry.category },
          extra: {
            data: entry.data,
            timestamp: entry.timestamp,
          },
        });
      }
    } catch (e) {
      console.error("Failed to log to Sentry", e);
    }
  }

  private logToFirebase(entry: LogEntry): void {
    // Implémentation à ajouter si nécessaire
    // Cette méthode pourrait envoyer les logs à Firebase Analytics ou Firestore
  }
}

export const logger = Logger.getInstance();
