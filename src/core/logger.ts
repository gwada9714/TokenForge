interface LogEntry {
  message: string;
  error?: Error;
  metadata?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private readonly isDev = import.meta.env.DEV;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  error(entry: LogEntry): void {
    console.error({
      timestamp: new Date().toISOString(),
      environment: this.isDev ? 'development' : 'production',
      ...entry,
      error: entry.error ? {
        message: entry.error.message,
        stack: this.isDev ? entry.error.stack : undefined
      } : undefined
    });
  }
}

export const logger = Logger.getInstance();
