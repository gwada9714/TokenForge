import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import { useTokenForgeAdmin } from '../../../../hooks/useTokenForgeAdmin';
import type { AuditLog } from '../../../../types/contracts';
import { AuditLogList } from './AuditLogList';
import { AuditLogToolbar } from './AuditLogToolbar';
import { AdminComponentProps } from '../types';
import { ForgeCard } from '../../../common/ForgeCard';

export const AuditLogs: React.FC<AdminComponentProps> = ({ onError }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [confirmAction, setConfirmAction] = useState<'purge' | null>(null);
  const { contract, error: adminError } = useTokenForgeAdmin({ onError });

  const loadLogs = useCallback(async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      const auditLogs = await contract.getAuditLogs();
      setLogs(auditLogs);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [contract, onError]);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const csvContent = logs
        .map(log => `${log.timestamp},${log.level},${log.category},${log.message}`)
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to export logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurge = async () => {
    try {
      setIsLoading(true);
      await contract.purgeAuditLogs();
      setLogs([]);
      setConfirmAction(null);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to purge logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
  };

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (adminError) {
    return (
      <ForgeCard>
        <Alert severity="error">
          Une erreur est survenue lors du chargement des logs d'audit
        </Alert>
      </ForgeCard>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AuditLogToolbar
        onExport={handleExport}
        onPurge={() => setConfirmAction('purge')}
        isLoading={isLoading}
        disabled={logs.length === 0}
      />

      <AuditLogList
        logs={logs}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />

      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails du Log</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Timestamp: {new Date(selectedLog.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Level: {selectedLog.level}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Category: {selectedLog.category}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Message: {selectedLog.message}
              </Typography>
              {selectedLog.data && (
                <Typography variant="subtitle1" component="pre" sx={{ mt: 2 }}>
                  Data: {JSON.stringify(selectedLog.data, null, 2)}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmAction === 'purge'}
        onClose={() => setConfirmAction(null)}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer tous les logs d'audit ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)} color="inherit">
            Annuler
          </Button>
          <Button onClick={handlePurge} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(AuditLogs);
