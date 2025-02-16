import { LogLevel, LogEntry } from './types';

export interface LogMetadata {
  [key: string]: unknown;
}

export interface LogEntry {
  category: string;
  message: string;
  error?: Error;
  metadata?: LogMetadata;
}

class Logger {
  private static instance: Logger;
  private readonly isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const metadata = entry.metadata ? 
      `\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}` : '';
    const error = entry.error ? 
      `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` : '';

    return `[${timestamp}] [${entry.category}] ${entry.message}${metadata}${error}`;
  }

  debug(entry: LogEntry): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(entry));
    }
  }

  info(entry: LogEntry): void {
    console.info(this.formatMessage(entry));
  }

  warn(entry: LogEntry): void {
    console.warn(this.formatMessage(entry));
  }

  error(entry: LogEntry & { error?: Error }): void {
    console.error(this.formatMessage(entry));
  }
}

export const logger = Logger.getInstance();
