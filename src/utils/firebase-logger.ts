import { LogLevel, LogMessage } from '@/features/auth/types/ethereum';

interface LogEntry {
  message: string;
  category: string;
  error?: Error;
  userId?: string;
  timestamp?: string;
  level?: 'info' | 'error' | 'warn' | 'debug';
  [key: string]: any;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  message: string;
  [key: string]: any;
}

class FirebaseLogger {
  private static instance: FirebaseLogger;

  private constructor() {}

  static getInstance(): FirebaseLogger {
    if (!this.instance) {
      this.instance = new FirebaseLogger();
    }
    return this.instance;
  }

  debug(message: LogMessage): void {
    console.debug('[DEBUG]', message);
  }

  info(message: LogMessage): void {
    console.info('[INFO]', message);
  }

  warn(message: LogMessage): void {
    console.warn('[WARN]', message);
  }

  error(message: LogMessage): void {
    console.error('[ERROR]', message);
  }
}

export const logger = FirebaseLogger.getInstance();
