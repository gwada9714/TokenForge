export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerMessage {
  category: string;
  message: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}

export interface Logger {
  debug(message: LoggerMessage): void;
  info(message: LoggerMessage): void;
  warn(message: LoggerMessage): void;
  error(message: LoggerMessage): void;
  log(level: LogLevel, message: LoggerMessage): void;
}
