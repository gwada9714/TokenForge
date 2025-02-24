export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  message: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

export interface Logger {
  debug(entry: LogEntry): void;
  info(entry: LogEntry): void;
  warn(entry: LogEntry): void;
  error(entry: LogEntry): void;
  setLogLevel(level: LogLevel): void;
}
