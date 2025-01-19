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
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { monitor } from '../../utils/monitoring';
import { useContractRead, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { TokenForgeFactoryABI } from '../../abi/TokenForgeFactory';
import { TOKEN_FORGE_ADDRESS } from '../../constants/addresses';
import { AuditLog } from '../../types/contracts';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { contract } = useTokenForgeAdmin();
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Lecture des logs
  const { data: auditLogs, refetch: refetchLogs } = useContractRead({
    address: TOKEN_FORGE_ADDRESS,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'getAuditLogs',
    watch: true,
  }) as { data: AuditLog[] | undefined, refetch: () => void };

  // Écriture pour la purge
  const { writeContract } = useWriteContract();
  const { waitForTransactionReceipt } = useWaitForTransactionReceipt();

  // Mise à jour des logs quand les données changent
  useEffect(() => {
    if (auditLogs) {
      setLogs(auditLogs);
      monitor.info('AuditLogs', 'Audit logs updated', { count: auditLogs.length });
    }
  }, [auditLogs]);

  const handleExportLogs = useCallback(() => {
    monitor.info('AuditLogs', 'Exporting logs to CSV');
    
    try {
      const headers = ['Date', 'Action', 'Détails', 'Adresse'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => {
          const date = new Date(Number(log.timestamp) * 1000).toISOString();
          return `${date},${log.action},${log.details},${log.address}`;
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      monitor.info('AuditLogs', 'Logs exported successfully', { count: logs.length });
    } catch (error) {
      monitor.error('AuditLogs', 'Error exporting logs', { error });
      console.error('Erreur lors de l\'export des logs:', error);
    }
  }, [logs]);

  const handlePurgeLogs = useCallback(async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      const { hash } = await writeContract({
        ...contract,
        functionName: 'purgeAuditLogs',
      });

      await waitForTransactionReceipt({ hash });
      refetchLogs();
      setIsLoading(false);
    } catch (error) {
      monitor.error('AuditLogs', 'Error purging audit logs', { error });
      console.error('Erreur lors de la purge des logs:', error);
    }
  }, [contract, writeContract, waitForTransactionReceipt, refetchLogs]);

  const isActionDisabled = isLoading;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Logs d'Audit
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportLogs}
              disabled={isActionDisabled || logs.length === 0}
              sx={{ mr: 1 }}
            >
              Exporter
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={isActionDisabled ? <CircularProgress size={20} /> : <DeleteIcon />}
              onClick={handlePurgeLogs}
              disabled={isActionDisabled || logs.length === 0}
            >
              Purger
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Détails</TableCell>
                  <TableCell>Adresse</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id.toString()}>
                    <TableCell>{new Date(Number(log.timestamp) * 1000).toLocaleString()}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogs;
