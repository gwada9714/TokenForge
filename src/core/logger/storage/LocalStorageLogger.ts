import { LogEntry, Logger, LogLevel } from "../types";

export class LocalStorageLogger implements Logger {
  private readonly storageKey = "app_logs";
  private readonly maxLogs = 1000;

  private saveLog(entry: LogEntry) {
    const logs = this.getLogs();
    logs.push({ ...entry, timestamp: new Date().toISOString() });

    if (logs.length > this.maxLogs) {
      logs.shift();
    }

    localStorage.setItem(this.storageKey, JSON.stringify(logs));
  }

  private getLogs(): LogEntry[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  debug(entry: LogEntry) {
    this.saveLog({ ...entry, level: LogLevel.DEBUG });
  }
  info(entry: LogEntry) {
    this.saveLog({ ...entry, level: LogLevel.INFO });
  }
  warn(entry: LogEntry) {
    this.saveLog({ ...entry, level: LogLevel.WARN });
  }
  error(entry: LogEntry) {
    this.saveLog({ ...entry, level: LogLevel.ERROR });
  }
}
