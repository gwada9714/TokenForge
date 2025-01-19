import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  category: 'token' | 'contract' | 'admin' | 'user' | 'system';
  severity: 'info' | 'warning' | 'error';
  details: {
    description: string;
    address?: string;
    transactionHash?: string;
    metadata?: Record<string, any>;
  };
  userId: string;
}

export interface LogFilter {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  severity?: string[];
  userId?: string;
}

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const fetchLogs = useCallback(async (filters?: LogFilter) => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API call
      // This is mock data for development
      const mockLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: new Date(Date.now() - i * 3600000),
        action: ['Created', 'Updated', 'Deleted', 'Deployed'][Math.floor(Math.random() * 4)],
        category: ['token', 'contract', 'admin', 'user', 'system'][Math.floor(Math.random() * 5)] as AuditLog['category'],
        severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)] as AuditLog['severity'],
        details: {
          description: `Sample audit log ${i}`,
          address: '0x' + i.toString(16).padStart(40, '0'),
          transactionHash: '0x' + Math.random().toString(16).slice(2).padStart(64, '0'),
        },
        userId: address,
      }));

      // Apply filters
      let filteredLogs = mockLogs;
      if (filters) {
        filteredLogs = mockLogs.filter(log => {
          if (filters.startDate && log.timestamp < filters.startDate) return false;
          if (filters.endDate && log.timestamp > filters.endDate) return false;
          if (filters.categories?.length && !filters.categories.includes(log.category)) return false;
          if (filters.severity?.length && !filters.severity.includes(log.severity)) return false;
          if (filters.userId && log.userId !== filters.userId) return false;
          return true;
        });
      }

      setLogs(filteredLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [address]);

  const addLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp' | 'userId'>) => {
    if (!address) return;

    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2),
      timestamp: new Date(),
      userId: address,
      ...log,
    };

    setLogs(prev => [newLog, ...prev]);
  }, [address]);

  const exportLogs = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    const data = format === 'csv'
      ? convertToCSV(logs)
      : JSON.stringify(logs, null, 2);

    const blob = new Blob([data], { type: `text/${format}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [logs]);

  const convertToCSV = (logs: AuditLog[]): string => {
    const headers = ['ID', 'Timestamp', 'Action', 'Category', 'Severity', 'Description', 'Address', 'Transaction Hash', 'User ID'];
    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.action,
      log.category,
      log.severity,
      log.details.description,
      log.details.address || '',
      log.details.transactionHash || '',
      log.userId,
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    addLog,
    exportLogs,
  };
};

export default useAuditLogs;
