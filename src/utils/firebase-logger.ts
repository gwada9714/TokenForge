import { FirebaseError } from 'firebase/app';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

class FirebaseLogger {
  private static instance: FirebaseLogger;
  private logs: Array<{ timestamp: Date; level: LogLevel; message: string; data?: any }> = [];

  private constructor() {}

  static getInstance(): FirebaseLogger {
    if (!FirebaseLogger.instance) {
      FirebaseLogger.instance = new FirebaseLogger();
    }
    return FirebaseLogger.instance;
  }

  log(level: LogLevel, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
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
  }

  getLogs(): Array<{ timestamp: Date; level: LogLevel; message: string; data?: any }> {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  formatFirebaseError(error: FirebaseError): string {
    return `Firebase Error: [${error.code}] ${error.message}`;
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = FirebaseLogger.getInstance();
