/**
 * Utilitaire de monitoring pour l'application TokenForge
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: unknown;
}

interface ErrorMetrics {
  count: number;
  lastOccurrence: Date;
  details: Array<{
    timestamp: Date;
    code: string;
    message: string;
    details?: any;
  }>;
}

class TokenForgeMonitor {
  private static instance: TokenForgeMonitor;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private errorMetrics: Map<string, ErrorMetrics> = new Map();
  private readonly MAX_ERROR_HISTORY = 100;

  private constructor() {}

  static getInstance(): TokenForgeMonitor {
    if (!TokenForgeMonitor.instance) {
      TokenForgeMonitor.instance = new TokenForgeMonitor();
    }
    return TokenForgeMonitor.instance;
  }

  private addLog(level: LogLevel, component: string, message: string, data?: unknown) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
    };

    this.logs.push(logEntry);
    
    // Garder uniquement les 1000 derniers logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // En développement, on affiche aussi dans la console
    if (process.env.NODE_ENV === 'development') {
      console[level](
        `[${logEntry.timestamp}] [${component}] ${message}`,
        data ? data : ''
      );
    }
  }

  info(component: string, message: string, data?: unknown) {
    this.addLog('info', component, message, data);
  }

  warn(component: string, message: string, data?: unknown) {
    this.addLog('warn', component, message, data);
  }

  error(component: string, message: string, data?: unknown) {
    this.addLog('error', component, message, data);
  }

  debug(component: string, message: string, data?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      this.addLog('debug', component, message, data);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level 
      ? this.logs.filter(log => log.level === level)
      : this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  trackAuthError(error: any): void {
    const errorCode = error.code;
    const currentMetrics = this.errorMetrics.get(errorCode) || {
      count: 0,
      lastOccurrence: new Date(),
      details: []
    };

    // Mettre à jour les métriques
    currentMetrics.count++;
    currentMetrics.lastOccurrence = new Date();
    currentMetrics.details.push({
      timestamp: new Date(),
      code: error.code,
      message: error.message,
      details: error.details
    });

    // Limiter l'historique des erreurs
    if (currentMetrics.details.length > this.MAX_ERROR_HISTORY) {
      currentMetrics.details = currentMetrics.details.slice(-this.MAX_ERROR_HISTORY);
    }

    this.errorMetrics.set(errorCode, currentMetrics);

    // Logger l'erreur
    this.error('Erreur d\'authentification détectée:', {
      code: error.code,
      message: error.message,
      details: error.details,
      metrics: {
        totalCount: currentMetrics.count,
        lastOccurrence: currentMetrics.lastOccurrence
      }
    });

    // TODO: Envoyer à un service externe (Sentry, LogRocket, etc.)
    this.sendToExternalService(error);
  }

  private sendToExternalService(error: any): void {
    // TODO: Implémenter l'envoi à un service de monitoring externe
    console.warn('Envoi à un service externe non implémenté:', error);
  }

  getErrorMetrics(): Map<string, ErrorMetrics> {
    return new Map(this.errorMetrics);
  }

  clearMetrics(): void {
    this.errorMetrics.clear();
  }
}

export const monitor = TokenForgeMonitor.getInstance();

export const logger = {
  error: (message: string, metadata?: Record<string, unknown>) => {
    console.error(message, metadata);
  },
  warn: (message: string, metadata?: Record<string, unknown>) => {
    console.warn(message, metadata);
  },
  info: (message: string, metadata?: Record<string, unknown>) => {
    console.info(message, metadata);
  },
  debug: (message: string, metadata?: Record<string, unknown>) => {
    console.debug(message, metadata);
  }
};
