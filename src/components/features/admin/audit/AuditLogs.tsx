import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTokenForgeAdmin } from '../../../../hooks/useTokenForgeAdmin';
import type { AuditLog } from '../../../../types/contracts';
import { AuditLogList } from './AuditLogList';
import { AuditLogToolbar } from './AuditLogToolbar';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { contract } = useTokenForgeAdmin();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [contract]);

  const loadLogs = async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const auditLogs = await contract.getAuditLogs();
      setLogs(auditLogs);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!logs.length) return;

    const csvContent = logs.map(log => {
      const date = new Date(log.timestamp * 1000).toLocaleString();
      return `${date},${log.action},${log.data},${log.address}`;
    }).join('\n');

    const blob = new Blob([`Date,Action,Data,Address\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handlePurge = async () => {
    if (!contract) return;
    try {
      await contract.purgeAuditLogs();
      await loadLogs();
    } catch (error) {
      console.error('Erreur lors de la purge des logs:', error);
    }
  };

  const handleDeleteLog = async (logId: number) => {
    if (!contract) return;
    try {
      await contract.deleteAuditLog(logId);
      await loadLogs();
    } catch (error) {
      console.error('Erreur lors de la suppression du log:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Logs d'Audit
      </Typography>

      <AuditLogToolbar
        onExport={handleExport}
        onPurge={handlePurge}
        disabled={!logs.length}
      />

      <AuditLogList
        logs={logs}
        onDeleteLog={handleDeleteLog}
      />
    </Box>
  );
};

export default AuditLogs;
