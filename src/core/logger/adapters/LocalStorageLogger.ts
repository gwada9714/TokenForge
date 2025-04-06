import { LogAdapter, LogEntry, LogLevel } from "../types";

/**
 * Adaptateur pour le logging dans le localStorage
 * Utile pour le débogage en développement
 */
export class LocalStorageLogger implements LogAdapter {
  private readonly storageKey = "tokenforge_logs";
  private readonly maxLogs = 1000;
  private logLevel: LogLevel = LogLevel.DEBUG;

  constructor(logLevel?: LogLevel) {
    if (logLevel) {
      this.logLevel = logLevel;
    }
  }

  /**
   * Définit le niveau de log minimum
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Vérifie si un niveau de log doit être traité
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
      [LogLevel.FATAL]: 4,
    };

    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Récupère les logs stockés
   */
  private getLogs(): any[] {
    try {
      const storedLogs = localStorage.getItem(this.storageKey);
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des logs du localStorage",
        error
      );
      return [];
    }
  }

  /**
   * Sauvegarde les logs dans le localStorage
   */
  private saveLogs(logs: any[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des logs dans le localStorage",
        error
      );
    }
  }

  /**
   * Convertit une entrée de log en objet sérialisable
   */
  private serializeLogEntry(entry: LogEntry): any {
    return {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      category: entry.category,
      message: entry.message,
      data: entry.data,
      error: entry.error
        ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          }
        : null,
    };
  }

  /**
   * Traite une entrée de log
   */
  public log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    try {
      // Récupérer les logs existants
      const logs = this.getLogs();

      // Ajouter le nouveau log
      logs.unshift(this.serializeLogEntry(entry));

      // Limiter le nombre de logs
      if (logs.length > this.maxLogs) {
        logs.length = this.maxLogs;
      }

      // Sauvegarder les logs
      this.saveLogs(logs);
    } catch (error) {
      console.error("Erreur lors du logging dans le localStorage", error);
    }
  }

  /**
   * Efface tous les logs
   */
  public clearLogs(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error(
        "Erreur lors de l'effacement des logs du localStorage",
        error
      );
    }
  }

  /**
   * Récupère tous les logs
   */
  public getAllLogs(): any[] {
    return this.getLogs();
  }
}
