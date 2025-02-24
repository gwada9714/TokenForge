import { LogLevel, LogMessage } from '@/features/auth/types/ethereum';

class Logger {
  private logToConsole(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const logMessage: LogMessage = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    switch (level) {
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
    }
  }

  info(message: string, data?: Record<string, unknown>) {
    this.logToConsole('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.logToConsole('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.logToConsole('error', message, data);
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.logToConsole('debug', message, data);
  }
}

export const logger = new Logger();
