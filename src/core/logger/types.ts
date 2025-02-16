export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogMetadata {
  [key: string]: unknown;
}

export interface LogEntry {
  category: string;
  message: string;
  level: LogLevel;
  metadata?: LogMetadata;
  timestamp?: string;
  error?: Error;
}

export interface Logger {
  debug(entry: LogEntry): void;
  info(entry: LogEntry): void;
  warn(entry: LogEntry): void;
  error(entry: LogEntry): void;
}
