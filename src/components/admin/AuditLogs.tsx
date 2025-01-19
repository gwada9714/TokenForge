import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useContractRead, useWriteContract } from 'wagmi';
import { TokenForgeFactoryABI } from '../../abi/TokenForgeFactory';
import { TOKEN_FORGE_ADDRESS } from '../../constants/addresses';
import { AuditLog } from '../../types/contracts';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { contract } = useTokenForgeAdmin();
  const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);

  // Lecture des logs
  const { data: auditLogs, refetch: refetchLogs } = useContractRead({
    address: TOKEN_FORGE_ADDRESS,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'getAuditLogs',
    query: {
      enabled: true,
    }
  });

  // Mise à jour des logs quand les données changent
  useEffect(() => {
    if (auditLogs) {
      setLogs(auditLogs);
    }
  }, [auditLogs]);

  const handleExportLogs = () => {
    try {
      const headers = ['Date', 'Action', 'Détails', 'Adresse'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          new Date(log.timestamp * 1000).toLocaleString(),
          log.action,
          log.details,
          log.address
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'audit_logs.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const handlePurgeLogs = async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        abi: TokenForgeFactoryABI.abi,
        address: TOKEN_FORGE_ADDRESS,
        functionName: 'purgeAuditLogs',
      });

      await refetchLogs();
      setIsLoading(false);
    } catch (error) {
      console.error('Error purging logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Logs d'Audit</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportLogs}
              disabled={isLoading || logs.length === 0}
              sx={{ mr: 1 }}
            >
              Exporter
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handlePurgeLogs}
              disabled={isLoading || logs.length === 0}
            >
              Purger
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Typography>Aucun log d'audit disponible</Typography>
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
                {logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(log.timestamp * 1000).toLocaleString()}</TableCell>
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
