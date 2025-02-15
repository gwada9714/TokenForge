import type { Logger, LogEntry, LogMetadata } from './types';

export class BaseLogger implements Logger {
  private static instance: BaseLogger;

  private constructor() {}

  static getInstance(): BaseLogger {
    if (!BaseLogger.instance) {
      BaseLogger.instance = new BaseLogger();
    }
    return BaseLogger.instance;
  }

  private formatEntry(entry: LogEntry): LogEntry {
    return {
      ...entry,
      metadata: {
        ...entry.metadata,
        timestamp: Date.now(),
        errorName: entry.error?.name,
        errorMessage: entry.error?.message,
        errorStack: entry.error?.stack
      }
    };
  }

  debug(entry: LogEntry): void {
    if (import.meta.env.DEV) {
      console.debug(this.formatEntry(entry));
    }
  }

  info(entry: LogEntry): void {
    console.info(this.formatEntry(entry));
  }

  warn(entry: LogEntry): void {
    console.warn(this.formatEntry(entry));
  }

  error(entry: LogEntry): void {
    console.error(this.formatEntry(entry));
  }
}

export const logger = BaseLogger.getInstance();
