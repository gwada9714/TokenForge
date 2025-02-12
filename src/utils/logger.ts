import type { LogMessage } from '../types/firebase';

interface Logger {
  info(category: string, message: LogMessage): void;
  warn(category: string, message: LogMessage): void;
  error(category: string, message: LogMessage & { error?: Error }): void;
  debug(category: string, message: LogMessage): void;
}

const formatLogMessage = (category: string, message: LogMessage): string => {
  const timestamp = new Date().toISOString();
  const context = message.context ? `\nContext: ${JSON.stringify(message.context, null, 2)}` : '';
  const error = message.error ? `\nError: ${message.error.message}\nStack: ${message.error.stack}` : '';
  
  return `[${timestamp}] [${category}] ${message.message}${context}${error}`;
};

const isDevelopment = import.meta.env.VITE_ENV === 'development';

export const logger: Logger = {
  info: (category: string, message: LogMessage) => {
    console.info(formatLogMessage(category, message));
  },
  
  warn: (category: string, message: LogMessage) => {
    console.warn(formatLogMessage(category, message));
  },
  
  error: (category: string, message: LogMessage & { error?: Error }) => {
    console.error(formatLogMessage(category, message));
    
    // En production, on pourrait envoyer à Sentry ou autre service de monitoring
    if (!isDevelopment && message.error) {
      // TODO: Intégrer Sentry ou autre service
      console.error('Error details:', message.error);
    }
  },
  
  debug: (category: string, message: LogMessage) => {
    if (isDevelopment) {
      console.debug(formatLogMessage(category, message));
    }
  }
};
