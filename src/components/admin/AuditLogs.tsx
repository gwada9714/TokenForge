import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { monitor } from '../../utils/monitoring';

/**
 * Interface représentant un log d'audit
 * @interface AuditLog
 * @property {string} id - Identifiant unique du log
 * @property {string} timestamp - Horodatage de l'événement
 * @property {string} action - Type d'action effectuée
 * @property {string} details - Détails de l'action
 * @property {string} address - Adresse Ethereum ayant effectué l'action
 */
interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  address: string;
}

/**
 * Composant d'affichage et de gestion des logs d'audit
 * 
 * Permet de visualiser l'historique des actions effectuées sur le contrat,
 * d'exporter les logs en CSV et de les purger si nécessaire.
 * 
 * Fonctionnalités :
 * - Chargement automatique des logs au montage
 * - Export au format CSV
 * - Purge des logs avec confirmation
 * - Gestion des états de chargement
 * 
 * @component
 * @example
 * ```tsx
 * <AuditLogs />
 * ```
 */
export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { contract, isProcessing } = useTokenForgeAdmin();

  const fetchLogs = useCallback(async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      monitor.info('AuditLogs', 'Fetching audit logs');
      const auditLogs = await contract.getAuditLogs();
      setLogs(auditLogs);
      monitor.info('AuditLogs', 'Audit logs fetched successfully', { count: auditLogs.length });
    } catch (error) {
      monitor.error('AuditLogs', 'Error fetching audit logs', { error });
      console.error('Erreur lors de la récupération des logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  const handleExportLogs = useCallback(() => {
    monitor.info('AuditLogs', 'Exporting logs to CSV');
    const csvContent = logs.map(log => 
      `${log.timestamp},${log.action},${log.details},${log.address}`
    ).join('\n');
    
    try {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      monitor.info('AuditLogs', 'Logs exported successfully', { count: logs.length });
    } catch (error) {
      monitor.error('AuditLogs', 'Error exporting logs', { error });
      console.error('Erreur lors de l\'export des logs:', error);
    }
  }, [logs]);

  const handlePurgeLogs = useCallback(async () => {
    if (!contract) return;

    if (window.confirm('Êtes-vous sûr de vouloir purger tous les logs ?')) {
      try {
        monitor.warn('AuditLogs', 'Purging all audit logs');
        await contract.purgeAuditLogs();
        setLogs([]);
        monitor.info('AuditLogs', 'Audit logs purged successfully');
      } catch (error) {
        monitor.error('AuditLogs', 'Error purging audit logs', { error });
        console.error('Erreur lors de la purge des logs:', error);
      }
    }
  }, [contract]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Logs d'Audit
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportLogs}
              sx={{ mr: 1 }}
              disabled={isLoading || isProcessing || logs.length === 0}
            >
              Exporter
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handlePurgeLogs}
              disabled={isLoading || isProcessing || logs.length === 0}
            >
              Purger
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Détails</TableCell>
                <TableCell>Adresse</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{log.address}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {isLoading ? 'Chargement des logs...' : 'Aucun log disponible'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
