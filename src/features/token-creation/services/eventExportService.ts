import { TokenEvent } from './eventMonitorService';
import { formatEther } from 'viem';

export interface ExportOptions {
  format: 'csv' | 'json';
  dateRange?: {
    start: Date;
    end: Date;
  };
  eventTypes?: TokenEvent['type'][];
  minAmount?: bigint;
}

export class EventExportService {
  private formatDate(date: number): string {
    return new Date(date).toISOString();
  }

  private formatAmount(amount: bigint): string {
    return formatEther(amount);
  }

  private filterEvents(events: TokenEvent[], options: ExportOptions): TokenEvent[] {
    return events.filter(event => {
      const matchesType = !options.eventTypes?.length || 
        options.eventTypes.includes(event.type);
      
      const matchesDateRange = !options.dateRange ||
        (event.timestamp >= options.dateRange.start.getTime() &&
         event.timestamp <= options.dateRange.end.getTime());
      
      const matchesAmount = !options.minAmount ||
        event.amount >= options.minAmount;

      return matchesType && matchesDateRange && matchesAmount;
    });
  }

  private convertToCSV(events: TokenEvent[]): string {
    const headers = ['Type', 'From', 'To', 'Amount', 'Timestamp'];
    const rows = events.map(event => [
      event.type,
      event.from,
      event.to,
      this.formatAmount(event.amount),
      this.formatDate(event.timestamp)
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  exportEvents(events: TokenEvent[], options: ExportOptions): string {
    const filteredEvents = this.filterEvents(events, options);

    if (options.format === 'csv') {
      return this.convertToCSV(filteredEvents);
    }

    // Format JSON avec des montants lisibles
    return JSON.stringify(
      filteredEvents.map(event => ({
        ...event,
        amount: this.formatAmount(event.amount),
        timestamp: this.formatDate(event.timestamp)
      })),
      null,
      2
    );
  }

  downloadEvents(events: TokenEvent[], options: ExportOptions): void {
    const content = this.exportEvents(events, options);
    const blob = new Blob(
      [content],
      { type: options.format === 'csv' ? 'text/csv' : 'application/json' }
    );
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `token-events.${options.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
