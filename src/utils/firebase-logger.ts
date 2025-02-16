export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogOptions {
  category?: string;
  metadata?: Record<string, unknown>;
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

  private formatMessage(message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const category = options?.category ? `[${options.category}]` : '';
    const metadata = options?.metadata ? 
      `\n${JSON.stringify(options.metadata, null, 2)}` : '';

    return `[${timestamp}] ${category} ${message}${metadata}`;
  }

  debug(message: string, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(message, options));
    }
  }

  info(message: string, options?: LogOptions): void {
    console.info(this.formatMessage(message, options));
  }

  warn(message: string, options?: LogOptions): void {
    console.warn(this.formatMessage(message, options));
  }

  error(message: string, error?: Error, options?: LogOptions): void {
    const metadata = {
      ...options?.metadata,
      errorMessage: error?.message,
      stack: error?.stack
    };
    console.error(this.formatMessage(message, { ...options, metadata }));
  }
}

export const logger = Logger.getInstance();
