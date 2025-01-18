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

class TokenForgeMonitor {
  private static instance: TokenForgeMonitor;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

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
}

export const monitor = TokenForgeMonitor.getInstance();
