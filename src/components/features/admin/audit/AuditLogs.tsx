import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useTokenForgeAdmin } from '../../../../hooks/useTokenForgeAdmin';
import type { AuditLog } from '../../../../types/contracts';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { contract } = useTokenForgeAdmin();
  const [isLoading, setIsLoading] = useState(false);

  // Chargement initial des logs
  useEffect(() => {
    loadLogs();
  }, [contract]);

  // Chargement des logs
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

  // Export des logs
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
    a.download = 'audit_logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Suppression des logs
  const handlePurge = async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      await contract.purgeAuditLogs();
      await loadLogs();
    } catch (error) {
      console.error('Erreur lors de la purge des logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          Logs d'Audit
        </Typography>
        <Box>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={isLoading || !logs.length}
            sx={{ mr: 1 }}
          >
            Exporter
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={handlePurge}
            disabled={isLoading || !logs.length}
          >
            Purger
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {logs.map((log) => (
            <ListItem key={log.id}>
              <ListItemText
                primary={log.action}
                secondary={`${new Date(log.timestamp * 1000).toLocaleString()} - ${log.data}`}
              />
              <ListItemSecondaryAction>
                <Typography variant="caption" color="textSecondary">
                  {log.address}
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
