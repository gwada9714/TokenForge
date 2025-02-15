export interface LogMetadata extends Record<string, unknown> {
  timestamp?: number;
  service?: string;
  errorCode?: string;
}

export interface LogEntry {
  category: string;
  message: string;
  error?: Error;
  metadata?: LogMetadata;
  level?: 'debug' | 'info' | 'warn' | 'error';
}

export interface Logger {
  debug(entry: LogEntry): void;
  info(entry: LogEntry): void;
  warn(entry: LogEntry): void;
  error(entry: LogEntry): void;
}
