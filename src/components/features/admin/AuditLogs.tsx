import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useContract } from '../../../hooks/useContract';
import { Contract, EventLog } from 'ethers';

interface AuditLog {
  id: string;
  action: string;
  address: string;
  timestamp: number;
  details: string;
  status: 'success' | 'failure';
  blockNumber: number;
  transactionHash: string;
}

interface AuditLogEvent extends EventLog {
  args: {
    action: string;
    account: string;
    details: string;
    success: boolean;
  };
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const { contract } = useContract('token');

  const fetchLogs = useCallback(async () => {
    if (!contract) return;

    try {
      const events = await contract.queryFilter('AuditLog') as AuditLogEvent[];
      
      if (events) {
        const formattedLogs = await Promise.all(
          events.map(async (event) => {
            const block = await event.getBlock();
            return {
              id: event.transactionHash,
              action: event.args.action,
              address: event.args.account,
              timestamp: block.timestamp * 1000,
              details: event.args.details,
              status: event.args.success ? 'success' : 'failure',
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            } as AuditLog;
          })
        );

        setLogs(formattedLogs);
        setTotalCount(formattedLogs.length);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  }, [contract]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['ID', 'Action', 'Address', 'Timestamp', 'Details', 'Status', 'Block', 'Transaction Hash'],
      ...logs.map(log => [
        log.id,
        log.action,
        log.address,
        new Date(log.timestamp).toISOString(),
        log.details,
        log.status,
        log.blockNumber,
        log.transactionHash,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(
    log =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedLogs = filteredLogs
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Audit Logs</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <FilterIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
          <Tooltip title="Export logs">
            <IconButton onClick={handleExportLogs}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Info</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Tooltip title={log.address}>
                        <span>{`${log.address.slice(0, 6)}...${log.address.slice(-4)}`}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        color={log.status === 'success' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Block: ${log.blockNumber}\nTx: ${log.transactionHash}`}>
                        <IconButton size="small">
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogs;
