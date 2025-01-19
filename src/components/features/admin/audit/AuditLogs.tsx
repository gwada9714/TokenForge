import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useTokenForgeAdmin } from '../../../../hooks/useTokenForgeAdmin';
import type { AuditLog } from '../../../../types/contracts';
import { AuditLogList } from './AuditLogList';
import { AuditLogToolbar } from './AuditLogToolbar';

/**
 * Composant de gestion des logs d'audit.
 * Affiche l'historique des actions effectuées sur le contrat.
 *
 * @component
 * @example
 * ```tsx
 * <AuditLogs />
 * ```
 *
 * @remarks
 * Les logs sont stockés sur la blockchain et peuvent être exportés ou purgés.
 * Chaque log contient des informations sur l'action effectuée, l'adresse de
 * l'utilisateur et l'horodatage.
 */
export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { contract } = useTokenForgeAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleConfirmAction = async () => {
    try {
      await confirmDialog.action();
      handleConfirmDialogClose();
    } catch (err) {
      console.error('Erreur lors de l\'exécution de l\'action:', err);
      showError('Une erreur est survenue lors de l\'exécution de l\'action');
    }
  };

  const loadLogs = useCallback(async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const auditLogs = await contract.getAuditLogs();
      setLogs(auditLogs);
    } catch (err) {
      showError('Erreur lors du chargement des logs');
      console.error('Erreur lors du chargement des logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExport = useCallback(async () => {
    if (!logs.length) {
      showError('Aucun log à exporter');
      return;
    }

    try {
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
      showSuccess('Logs exportés avec succès');
    } catch (err) {
      showError('Erreur lors de l\'export des logs');
      console.error('Erreur lors de l\'export des logs:', err);
    }
  }, [logs]);

  const handlePurge = useCallback(() => {
    setConfirmDialog({
      open: true,
      title: 'Confirmer la purge',
      message: 'Êtes-vous sûr de vouloir supprimer tous les logs ? Cette action est irréversible.',
      action: async () => {
        if (!contract) return;
        try {
          await contract.purgeAuditLogs();
          await loadLogs();
          showSuccess('Logs purgés avec succès');
        } catch (err) {
          showError('Erreur lors de la purge des logs');
          console.error('Erreur lors de la purge des logs:', err);
        }
      },
    });
  }, [contract, loadLogs]);

  const handleDeleteLog = useCallback((logId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce log ?',
      action: async () => {
        if (!contract) return;
        try {
          await contract.deleteAuditLog(logId);
          await loadLogs();
          showSuccess('Log supprimé avec succès');
        } catch (err) {
          showError('Erreur lors de la suppression du log');
          console.error('Erreur lors de la suppression du log:', err);
        }
      },
    });
  }, [contract, loadLogs]);

  if (isLoading && !logs.length) {
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
        disabled={!logs.length || isLoading}
      />

      <AuditLogList
        logs={logs}
        onDeleteLog={handleDeleteLog}
        isLoading={isLoading}
      />

      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Annuler</Button>
          <Button onClick={handleConfirmAction} color="error" autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditLogs;
