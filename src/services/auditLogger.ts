import { Address } from 'viem';

export enum AuditActionType {
  PAUSE = 'PAUSE',
  UNPAUSE = 'UNPAUSE',
  TRANSFER_OWNERSHIP = 'TRANSFER_OWNERSHIP',
  FAILED_ATTEMPT = 'FAILED_ATTEMPT'
}

export interface LogDetails {
  status: 'SUCCESS' | 'FAILED';
  transactionHash?: string;
  error?: string;
  targetAddress?: `0x${string}`;
  gasUsed?: number;
  networkInfo: {
    chainId: number;
    networkName: string;
  };
}

export interface AuditLog {
  timestamp: string;
  action: AuditActionType;
  performedBy: Address;
  details: LogDetails;
}

const STORAGE_KEY = 'tokenforge_audit_logs';

class AuditLogger {
  private logs: AuditLog[];

  constructor() {
    this.logs = this.loadLogs();
  }

  private loadLogs(): AuditLog[] {
    try {
      const storedLogs = localStorage.getItem(STORAGE_KEY);
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error('Error loading audit logs:', error);
      return [];
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving audit logs:', error);
    }
  }

  addLog(log: AuditLog): void {
    this.logs.unshift(log); // Ajouter au début pour avoir les plus récents en premier
    // Garder seulement les 1000 derniers logs pour éviter de surcharger le localStorage
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }
    this.saveLogs();
  }

  getLogs(
    filters?: {
      action?: AuditActionType;
      status?: 'SUCCESS' | 'FAILED';
      startDate?: Date;
      endDate?: Date;
    }
  ): AuditLog[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.status) {
        filteredLogs = filteredLogs.filter(log => log.details.status === filters.status);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= filters.startDate!
        );
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= filters.endDate!
        );
      }
    }

    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const auditLogger = new AuditLogger();
