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

const isDevelopment = import.meta.env.VITE_ENV === 'development';

export const logger = {
    debug: (entry: LogEntry) => {
        if (import.meta.env.DEV) {
            console.debug(`[${entry.category}] ${entry.message}`, {
                error: entry.error,
                metadata: entry.metadata
            });
        }
    },
    
    info: (entry: LogEntry) => {
        console.info(`[${entry.category}] ${entry.message}`, {
            metadata: entry.metadata
        });
    },
    
    error: (entry: LogEntry) => {
        console.error(`[${entry.category}] ${entry.message}`, {
            error: entry.error,
            metadata: entry.metadata
        });
    }
};
