export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, any>;
  error?: Error;
}

export interface LoggerOptions {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableSentry: boolean;
  enableFirebase: boolean;
}

export interface LogAdapter {
  log(entry: LogEntry): void;
  setLogLevel?(level: LogLevel): void;
}
