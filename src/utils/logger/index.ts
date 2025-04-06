import { Logger, LoggerMessage, LogLevel } from "./types";

class AppLogger implements Logger {
  private formatMessage(
    level: LogLevel,
    { category, message, error, metadata }: LoggerMessage
  ): string {
    const timestamp = new Date().toISOString();
    const metadataStr = metadata
      ? ` | metadata: ${JSON.stringify(metadata)}`
      : "";
    const errorStr = error
      ? ` | error: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      : "";
    return `[${timestamp}] ${level.toUpperCase()} [${category}] ${message}${metadataStr}${errorStr}`;
  }

  log(level: LogLevel, message: LoggerMessage): void {
    console[level](this.formatMessage(level, message));
  }

  debug(message: LoggerMessage): void {
    this.log("debug", message);
  }
  info(message: LoggerMessage): void {
    this.log("info", message);
  }
  warn(message: LoggerMessage): void {
    this.log("warn", message);
  }
  error(message: LoggerMessage): void {
    this.log("error", message);
  }
}

export const logger = new AppLogger();
export * from "./types";
