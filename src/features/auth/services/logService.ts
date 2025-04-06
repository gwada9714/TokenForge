import { AuthError } from "../errors/AuthError";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
}

interface LogOptions {
  enableConsole?: boolean;
  maxLogEntries?: number;
  logLevel?: LogLevel;
}

const DEFAULT_OPTIONS: LogOptions = {
  enableConsole: true,
  maxLogEntries: 1000,
  logLevel: LogLevel.INFO,
};

class LogService {
  private static instance: LogService | null = null;
  private logs: LogEntry[] = [];
  private options: LogOptions;

  private constructor() {
    this.options = DEFAULT_OPTIONS;
  }

  static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  configure(options: Partial<LogOptions>): void {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const configuredLevelIndex = levels.indexOf(this.options.logLevel!);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= configuredLevelIndex;
  }

  private formatLogEntry(entry: LogEntry): string {
    const date = new Date(entry.timestamp).toISOString();
    let message = `[${date}] ${entry.level} [${entry.category}] ${entry.message}`;

    if (entry.data) {
      message += "\nData: " + JSON.stringify(entry.data, null, 2);
    }

    if (entry.error) {
      if (entry.error instanceof AuthError) {
        message += `\nError: ${entry.error.name} (${entry.error.code}): ${entry.error.message}`;
        if (entry.error.details) {
          message +=
            "\nDetails: " + JSON.stringify(entry.error.details, null, 2);
        }
      } else {
        message += `\nError: ${entry.error.message}`;
        if (entry.error.stack) {
          message += `\nStack: ${entry.error.stack}`;
        }
      }
    }

    return message;
  }

  private addLogEntry(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    this.logs.push(entry);

    // Limiter la taille du journal
    if (this.logs.length > this.options.maxLogEntries!) {
      this.logs = this.logs.slice(-this.options.maxLogEntries!);
    }

    // Afficher dans la console si activé
    if (this.options.enableConsole) {
      const formattedMessage = this.formatLogEntry(entry);
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }
  }

  debug(
    category: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.addLogEntry({
      timestamp: Date.now(),
      level: LogLevel.DEBUG,
      category,
      message,
      data,
    });
  }

  info(
    category: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.addLogEntry({
      timestamp: Date.now(),
      level: LogLevel.INFO,
      category,
      message,
      data,
    });
  }

  warn(
    category: string,
    message: string,
    data?: Record<string, unknown>,
    error?: Error
  ): void {
    this.addLogEntry({
      timestamp: Date.now(),
      level: LogLevel.WARN,
      category,
      message,
      data,
      error,
    });
  }

  error(
    category: string,
    message: string,
    error: Error,
    data?: Record<string, unknown>
  ): void {
    this.addLogEntry({
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      category,
      message,
      data,
      error,
    });
  }

  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    if (category) {
      filtered = filtered.filter((log) => log.category === category);
    }

    return filtered;
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logService = LogService.getInstance();
