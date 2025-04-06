import { LogLevel, Logger, LogEntry } from "./types";

export class BaseLogger implements Logger {
  private readonly category: string;
  private logLevel: LogLevel = LogLevel.INFO;

  constructor(category: string, level?: LogLevel) {
    this.category = category;
    if (level !== undefined) {
      this.logLevel = level;
    }
  }

  debug(entry: LogEntry): void {
    this.log(LogLevel.DEBUG, entry);
  }

  info(entry: LogEntry): void {
    this.log(LogLevel.INFO, entry);
  }

  warn(entry: LogEntry): void {
    this.log(LogLevel.WARN, entry);
  }

  error(entry: LogEntry): void {
    this.log(LogLevel.ERROR, entry);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private log(level: LogLevel, entry: LogEntry): void {
    if (level < this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const metadata = entry.metadata
      ? `\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}`
      : "";
    const errorInfo = entry.error
      ? `\nError: ${entry.error.message}${
          entry.error.stack ? `\nStack: ${entry.error.stack}` : ""
        }`
      : "";

    console.log(
      `[${timestamp}] [${level}] [${this.category}]: ${entry.message}${metadata}${errorInfo}`
    );
  }
}
