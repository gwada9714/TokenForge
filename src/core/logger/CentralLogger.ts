/**
 * Système de logging centralisé pour l'application.
 * Ce module sert de point d'entrée unique pour tous les besoins de logging.
 * Il achemine les logs vers les systèmes appropriés (console, Sentry, Firebase, etc.)
 */

import * as Sentry from '@sentry/react';
import { LogLevel, LogEntry, LoggerOptions, LogAdapter } from './types';
import { ConsoleLogger } from './adapters/ConsoleLogger';

/**
 * Logger central qui gère tous les logs de l'application
 */
export class CentralLogger {
  private static instance: CentralLogger;
  
  // Adaptateurs de logging
  private adapters: Map<string, LogAdapter> = new Map();
  
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
    // Initialiser les adaptateurs par défaut
    this.initializeDefaultAdapters();
    
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

  /**
   * Initialise les adaptateurs par défaut en fonction de la configuration
   */
  private async initializeDefaultAdapters(): Promise<void> {
    // Toujours ajouter l'adaptateur console
    this.registerAdapter('console', new ConsoleLogger());
    
    // Ajouter l'adaptateur Firebase si activé
    if (this.options.enableFirebase) {
      try {
        const { FirebaseLogger } = await import('./adapters/FirebaseLogger');
        this.registerAdapter('firebase', new FirebaseLogger());
      } catch (error) {
        console.warn('Impossible de charger l\'adaptateur Firebase Logger:', error);
      }
    }
    
    // Ajouter l'adaptateur LocalStorage en développement
    if (import.meta.env.DEV) {
      try {
        const { LocalStorageLogger } = await import('./adapters/LocalStorageLogger');
        this.registerAdapter('localStorage', new LocalStorageLogger());
      } catch (error) {
        console.warn('Impossible de charger l\'adaptateur LocalStorage Logger:', error);
      }
    }
  }

  /**
   * Obtient l'instance singleton du logger
   */
  public static getInstance(): CentralLogger {
    if (!CentralLogger.instance) {
      CentralLogger.instance = new CentralLogger();
    }
    return CentralLogger.instance;
  }

  /**
   * Configure le logger avec de nouvelles options
   */
  public configure(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Mettre à jour les adaptateurs si nécessaire
    if (options.minLevel !== undefined) {
      this.adapters.forEach(adapter => {
        if (adapter.setLogLevel) {
          adapter.setLogLevel(options.minLevel!);
        }
      });
    }
  }

  /**
   * Enregistre un nouvel adaptateur de logging
   */
  public registerAdapter(name: string, adapter: LogAdapter): void {
    this.adapters.set(name, adapter);
  }

  /**
   * Supprime un adaptateur de logging
   */
  public removeAdapter(name: string): void {
    this.adapters.delete(name);
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
  private standardizeEntry(entry: Partial<LogEntry> | string): LogEntry {
    if (typeof entry === 'string') {
      return {
        timestamp: new Date(),
        level: LogLevel.INFO,
        category: 'General',
        message: entry
      };
    }
    
    return {
      timestamp: entry.timestamp || new Date(),
      level: entry.level || LogLevel.INFO,
      category: entry.category || 'General',
      message: entry.message || '',
      data: entry.data,
      error: entry.error
    };
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
    
    // Envoyer à tous les adaptateurs
    this.adapters.forEach(adapter => {
      try {
        adapter.log(entry);
      } catch (error) {
        console.error('Erreur dans l\'adaptateur de logging:', error);
      }
    });
    
    // Sentry pour les erreurs (toujours disponible même sans adaptateur)
    if (this.options.enableSentry && 
        (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) && 
        entry.error) {
      Sentry.captureException(entry.error, {
        tags: { category: entry.category },
        extra: entry.data || {}
      });
    }
  }

  /**
   * Récupère l'historique des logs
   */
  public getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Efface l'historique des logs
   */
  public clearLogHistory(): void {
    this.logHistory = [];
  }

  /**
   * Log de niveau DEBUG
   */
  public debug(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.DEBUG;
    this.handleLog(standardEntry);
  }

  /**
   * Log de niveau INFO
   */
  public info(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.INFO;
    this.handleLog(standardEntry);
  }

  /**
   * Log de niveau WARN
   */
  public warn(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.WARN;
    this.handleLog(standardEntry);
  }

  /**
   * Log de niveau ERROR
   */
  public error(entry: Partial<LogEntry> | string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const standardEntry = this.standardizeEntry(entry);
    standardEntry.level = LogLevel.ERROR;
    this.handleLog(standardEntry);
  }

  /**
   * Log de niveau FATAL
   */
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

  /**
   * Crée un logger avec une catégorie prédéfinie
   */
  public createLogger(category: string): {
    debug: (message: string, data?: any, error?: Error) => void;
    info: (message: string, data?: any, error?: Error) => void;
    warn: (message: string, data?: any, error?: Error) => void;
    error: (message: string, data?: any, error?: Error) => void;
    fatal: (message: string, data?: any, error?: Error) => void;
  } {
    return {
      debug: (message: string, data?: any, error?: Error) => {
        this.debug({ category, message, data, error });
      },
      info: (message: string, data?: any, error?: Error) => {
        this.info({ category, message, data, error });
      },
      warn: (message: string, data?: any, error?: Error) => {
        this.warn({ category, message, data, error });
      },
      error: (message: string, data?: any, error?: Error) => {
        this.error({ category, message, data, error });
      },
      fatal: (message: string, data?: any, error?: Error) => {
        this.fatal({ category, message, data, error });
      }
    };
  }
}
