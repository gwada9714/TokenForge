import { useState, useCallback } from 'react';

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';
export type LogCategory = 'security' | 'transaction' | 'network' | 'contract' | 'system';

export interface AuditLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  action: string;
  details: string;
  address?: string;
  transactionHash?: string;
  metadata?: Record<string, unknown>;
}

interface LogFilter {
  level?: LogLevel[];
  category?: LogCategory[];
  startDate?: Date;
  endDate?: Date;
  address?: string;
  searchText?: string;
}

interface AuditState {
  logs: AuditLog[];
  filters: LogFilter;
}

const MAX_LOGS = 1000; // Limite de stockage des logs

export const useAuditLogs = () => {
  const [state, setState] = useState<AuditState>({
    logs: [],
    filters: {},
  });

  // Ajouter un nouveau log
  const addLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, MAX_LOGS),
    }));

    return newLog.id;
  }, []);

  // Appliquer les filtres aux logs
  const getFilteredLogs = useCallback(
    (filters: LogFilter = state.filters) => {
      return state.logs.filter(log => {
        if (filters.level && !filters.level.includes(log.level)) {
          return false;
        }
        if (filters.category && !filters.category.includes(log.category)) {
          return false;
        }
        if (filters.startDate && log.timestamp < filters.startDate.getTime()) {
          return false;
        }
        if (filters.endDate && log.timestamp > filters.endDate.getTime()) {
          return false;
        }
        if (filters.address && log.address !== filters.address) {
          return false;
        }
        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          return (
            log.action.toLowerCase().includes(searchLower) ||
            log.details.toLowerCase().includes(searchLower) ||
            (log.address && log.address.toLowerCase().includes(searchLower)) ||
            (log.transactionHash && log.transactionHash.toLowerCase().includes(searchLower))
          );
        }
        return true;
      });
    },
    [state.logs]
  );

  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<LogFilter>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
    }));
  }, []);

  // Nettoyer les logs
  const clearLogs = useCallback(() => {
    setState(prev => ({
      ...prev,
      logs: [],
    }));
  }, []);

  // Exporter les logs
  const exportLogs = useCallback((format: 'json' | 'csv' = 'json') => {
    const filteredLogs = getFilteredLogs();
    
    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Category', 'Action', 'Details', 'Address', 'Transaction Hash'];
      const rows = filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.category,
        log.action,
        log.details,
        log.address || '',
        log.transactionHash || '',
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
      
      return csv;
    }
    
    return JSON.stringify(filteredLogs, null, 2);
  }, [getFilteredLogs]);

  // Purger les anciens logs
  const purgeLogs = useCallback((daysToKeep: number) => {
    const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    
    setState(prev => ({
      ...prev,
      logs: prev.logs.filter(log => log.timestamp >= cutoffDate),
    }));
  }, []);

  return {
    logs: state.logs,
    filters: state.filters,
    filteredLogs: getFilteredLogs(),
    addLog,
    updateFilters,
    resetFilters,
    clearLogs,
    exportLogs,
    purgeLogs,
  };
};
