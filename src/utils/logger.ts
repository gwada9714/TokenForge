import { AuthError } from '../features/auth/errors/AuthError';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  timestamp: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private readonly logs: LogEntry[] = [];
  private readonly maxLogs: number = 1000;
  private logHandlers: ((entry: LogEntry) => void)[] = [];

  private constructor() {
    // Capture les erreurs non gérées
    window.addEventListener('error', (event) => {
      this.error('Erreur non gérée:', {
        error: event.error,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Promesse rejetée non gérée:', {
        reason: event.reason
      });
    });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: Partial<LogContext> = {},
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE
      }
    };

    if (error) {
      entry.error = error;
      if (error instanceof AuthError) {
        entry.context.errorCode = error.code;
        entry.context.errorDetails = error.details;
      }
    }

    return entry;
  }

  private addLogEntry(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Notifier les handlers
    this.logHandlers.forEach(handler => handler(entry));

    // En développement, utiliser la console
    if (import.meta.env.DEV) {
      const consoleMethod = console[entry.level] || console.log;
      consoleMethod(
        `[${entry.level.toUpperCase()}] ${entry.message}`,
        entry.context,
        entry.error || ''
      );
    }
  }

  debug(message: string, context: Partial<LogContext> = {}): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.addLogEntry(entry);
  }

  info(message: string, context: Partial<LogContext> = {}): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.addLogEntry(entry);
  }

  warn(message: string, context: Partial<LogContext> = {}, error?: Error): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, error);
    this.addLogEntry(entry);
  }

  error(message: string, context: Partial<LogContext> = {}, error?: Error): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.addLogEntry(entry);
  }

  // Ajouter un handler pour les logs
  addHandler(handler: (entry: LogEntry) => void): () => void {
    this.logHandlers.push(handler);
    return () => {
      this.logHandlers = this.logHandlers.filter(h => h !== handler);
    };
  }

  // Récupérer les logs
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Effacer les logs
  clearLogs(): void {
    this.logs.length = 0;
  }

  // Exporter les logs au format JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = Logger.getInstance();
