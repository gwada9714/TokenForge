/**
 * Système de logging centralisé pour l'application.
 * Ce module sert de point d'entrée unique pour tous les besoins de logging.
 * Il achemine les logs vers les systèmes appropriés (console, Sentry, Firebase, etc.)
 */

import * as Sentry from '@sentry/react';
import { FirebaseLogger } from './logger/adapters/FirebaseLogger';
import { ConsoleLogger } from './logger/adapters/ConsoleLogger';
import { LogLevel, LogEntry, LoggerOptions } from './logger/types';

class CentralLogger {
  private static instance: CentralLogger;
  
  // Adaptateurs de logging
  private consoleLogger: ConsoleLogger;
  private firebaseLogger: FirebaseLogger | null = null;
  
  // Configuration
  private options: LoggerOptions = {
    minLevel: LogLevel.DEBUG,
    enableConsole: true,
    enableSentry: import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true',
    enableFirebase: import.meta.env.VITE_FIREBASE_LOGGING_ENABLED === 'true'
  };
  
  // Historique des logs (pour debug)
  private logHistory: LogEntry[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;

  private constructor() {
    this.consoleLogger = new ConsoleLogger();
    
    // Initialiser l'adaptateur Firebase si activé
    if (this.options.enableFirebase) {
      this.firebaseLogger = new FirebaseLogger();
    }
    
    // Log de démarrage
    this.info({
      category: 'Logger',
      message: 'Système de logging centralisé initialisé',
      data: { 
        config: { 
          minLevel: this.options.minLevel,
          enableSentry: this.options.enableSentry,
          enableFirebase: this.options.enableFirebase
        } 
      }
    });
  }

  public static getInstance(): CentralLogger {
    if (!CentralLogger.instance) {
      CentralLogger.instance = new CentralLogger();
    }
    return CentralLogger.instance;
  }

  public configure(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Mettre à jour FirebaseLogger si le statut a changé
    if (this.options.enableFirebase && !this.firebaseLogger) {
      this.firebaseLogger = new FirebaseLogger();
    } else if (!this.options.enableFirebase && this.firebaseLogger) {
      this.firebaseLogger = null;
    }
    
    this.info({
      category: 'Logger',
      message: 'Configuration du logger mise à jour',
      data: { newConfig: this.options }
    });
  }

  /**
   * Méthode générique pour traiter tous les logs
   */
  private handleLog(entry: LogEntry): void {
    // Ajouter timestamp si absent
    if (!entry.timestamp) {
      entry.timestamp = new Date();
    }
    
    // Stocker dans l'historique
    this.logHistory.unshift(entry);
    if (this.logHistory.length > this.MAX_HISTORY_SIZE) {
      this.logHistory.pop();
    }
    
    // Console logging
    if (this.options.enableConsole) {
      this.consoleLogger.log(entry);
    }
    
    // Firebase logging
    if (this.options.enableFirebase && this.firebaseLogger) {
      this.firebaseLogger.log(entry);
    }
    
    // Sentry pour les erreurs
    if (this.options.enableSentry && entry.level === LogLevel.ERROR && entry.error) {
      Sentry.captureException(entry.error, {
        tags: { category: entry.category },
        extra: entry.data || {}
      });
    }
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
      [LogLevel.FATAL]: 4
    };
    
    return levels[level] >= levels[this.options.minLevel];
  }

  /**
   * Standardise une entrée de log
   */
  private standardizeEntry(input: Partial<LogEntry> | string): LogEntry {
    if (typeof input === 'string') {
      return {
        timestamp: new Date(),
        level: LogLevel.INFO,
        category: 'App',
        message: input
      };
    }
    
    return {
      timestamp: input.timestamp || new Date(),
      level: input.level || LogLevel.INFO,
      category: input.category || 'App',
      message: input.message || '',
      data: input.data,
      error: input.error
    };
  }

  /**
   * Récupère l'historique des logs
   */
  public getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Efface l'historique des logs
   */
  public clearHistory(): void {
    this.logHistory = [];
    this.debug({
      category: 'Logger',
      message: 'Historique de logs effacé'
    });
  }

  // Méthodes publiques pour chaque niveau de log
  
  public debug(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.DEBUG;
    this.handleLog(standardEntry);
  }

  public info(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.INFO;
    this.handleLog(standardEntry);
  }

  public warn(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.WARN;
    this.handleLog(standardEntry);
  }

  public error(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.ERROR;
    this.handleLog(standardEntry);
  }

  public fatal(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.FATAL;
    this.handleLog(standardEntry);
  }

  /**
   * Méthode pour logger des événements métier importants
   */
  public logEvent(eventName: string, data?: Record<string, any>): void {
    this.info({
      category: 'Event',
      message: eventName,
      data
    });
  }
}

// Exporter l'instance singleton
export const logger = CentralLogger.getInstance();

// Ré-exporter les types avec la syntaxe correcte pour isolatedModules
export type { LogLevel, LogEntry, LoggerOptions } from './logger/types';
