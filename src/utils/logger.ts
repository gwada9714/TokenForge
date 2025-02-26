import type { LogMessage } from '../types/firebase';

interface Logger {
  info(category: string, message: LogMessage): void;
  warn(category: string, message: LogMessage): void;
  error(category: string, message: LogMessage & { error?: Error }): void;
  debug(category: string, message: LogMessage): void;
}

interface LogMetadata {
    [key: string]: unknown;
}

interface LogEntry {
    category: string;
    message: string;
    error?: Error;
    metadata?: LogMetadata;
}

const formatLogMessage = (category: string, message: LogMessage): string => {
  const timestamp = new Date().toISOString();
  const context = message.context ? `\nContext: ${JSON.stringify(message.context, null, 2)}` : '';
  const error = message.error ? `\nError: ${message.error.message}\nStack: ${message.error.stack}` : '';
  
  return `[${timestamp}] [${category}] ${message.message}${context}${error}`;
};

interface LogData {
  message: string;
  [key: string]: unknown;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  debug(category: string, data: LogData): void {
    if (this.isDevelopment) {
      console.debug(`[${category}]`, data);
    }
  }

  info(category: string, data: LogData): void {
    if (this.isDevelopment) {
      console.info(`[${category}]`, data);
    }
  }

  warn(category: string, data: LogData): void {
    console.warn(`[${category}]`, data);
  }

  error(category: string, data: LogData & { error?: unknown }): void {
    console.error(`[${category}]`, {
      ...data,
      error: data.error instanceof Error ? {
        message: data.error.message,
        stack: data.error.stack,
        name: data.error.name
      } : data.error
    });
  }
}

export const logger = Logger.getInstance();
