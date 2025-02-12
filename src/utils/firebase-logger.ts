import { FirebaseError } from 'firebase/app';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

export function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as FirebaseError).code === 'string'
  );
}

class FirebaseLogger {
  private static instance: FirebaseLogger;
  private logs: LogEntry[] = [];

  private constructor() {}

  static getInstance(): FirebaseLogger {
    if (!FirebaseLogger.instance) {
      FirebaseLogger.instance = new FirebaseLogger();
    }
    return FirebaseLogger.instance;
  }

  private formatError(error: unknown): Record<string, unknown> {
    try {
      if (isFirebaseError(error)) {
        return {
          code: error.code,
          message: error.message,
          stack: error.stack,
          name: error.name
        };
      }
      if (error instanceof Error) {
        return {
          message: error.message,
          stack: error.stack,
          name: error.name
        };
      }
      return {
        message: String(error)
      };
    } catch (formatError) {
      console.error('Error formatting error:', formatError);
      return { message: 'Error formatting failed' };
    }
  }

  private safePush(entry: LogEntry): void {
    try {
      this.logs.push(entry);
    } catch (error) {
      console.error('Failed to store log entry:', error);
    }
  }

  private safeConsoleLog(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    try {
      const formattedMessage = `[${level}] ${message}`;
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data);
          break;
        default:
          console.log(formattedMessage, data);
      }
    } catch (error) {
      console.error('Failed to log to console:', error);
    }
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    try {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level,
        message,
        data
      };
      
      this.safePush(logEntry);
      this.safeConsoleLog(level, message, data);
    } catch (error) {
      console.error('Critical logging error:', error);
    }
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: unknown): void {
    this.log(LogLevel.ERROR, message, this.formatError(error));
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  getLogs(): LogEntry[] {
    try {
      return [...this.logs];
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  clearLogs(): void {
    try {
      this.logs = [];
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  exportLogs(): string {
    try {
      return JSON.stringify(this.logs, null, 2);
    } catch (error) {
      console.error('Failed to export logs:', error);
      return '[]';
    }
  }
}

export const logger = FirebaseLogger.getInstance();
