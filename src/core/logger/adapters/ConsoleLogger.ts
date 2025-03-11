import { LogAdapter, LogEntry, LogLevel } from '../types';

/**
 * Adaptateur pour le logging dans la console
 */
export class ConsoleLogger implements LogAdapter {
  private formatMessage(entry: LogEntry): string {
    return `[${entry.level.toUpperCase()}] ${entry.category}: ${entry.message}`;
  }

  private formatData(data: any): any {
    if (!data) return undefined;
    
    // Convertir les objets complexes en format sérialisable
    if (typeof data === 'object' && data !== null) {
      try {
        // Éviter les références circulaires
        return JSON.parse(JSON.stringify(data));
      } catch (e) {
        return String(data);
      }
    }
    
    return data;
  }

  log(entry: LogEntry): void {
    const message = this.formatMessage(entry);
    const formattedData = this.formatData(entry.data);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, formattedData || '');
        break;
      case LogLevel.INFO:
        console.info(message, formattedData || '');
        break;
      case LogLevel.WARN:
        console.warn(message, formattedData || '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.error || '', formattedData || '');
        break;
      case LogLevel.FATAL:
        console.error(`FATAL: ${message}`, entry.error || '', formattedData || '');
        break;
      default:
        console.log(message, formattedData || '');
    }
  }
}
