import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
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

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  address: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { contract } = useTokenForgeAdmin();

  const handleExportLogs = useCallback(() => {
    const csvContent = logs.map(log => 
      `${log.timestamp},${log.action},${log.details},${log.address}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [logs]);

  const handlePurgeLogs = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir purger tous les logs ?')) {
      setLogs([]);
    }
  }, []);

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
            >
              Exporter
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handlePurgeLogs}
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
                    Aucun log disponible
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
