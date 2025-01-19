import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuditLogs, AuditLog, LogFilter } from '../hooks/useAuditLogs';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const AuditLogs: React.FC = () => {
  const { logs, loading, error, fetchLogs, exportLogs } = useAuditLogs();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [filters, setFilters] = useState<LogFilter>({
    startDate: undefined,
    endDate: undefined,
    categories: [],
    severity: [],
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: keyof LogFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchLogs(filters);
  };

  const getSeverityColor = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      if (filters.categories?.length && !filters.categories.includes(log.category)) return false;
      if (filters.severity?.length && !filters.severity.includes(log.severity)) return false;
      return true;
    });
  }, [logs, filters]);

  const paginatedLogs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Audit Logs</Typography>
        <Box display="flex" gap={1}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => exportLogs('csv')}
            disabled={loading || logs.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={filters.startDate || null}
              onChange={(date) => handleFilterChange('startDate', date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={filters.endDate || null}
              onChange={(date) => handleFilterChange('endDate', date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                value={filters.categories || []}
                onChange={(e) => handleFilterChange('categories', e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {['token', 'contract', 'admin', 'user', 'system'].map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                multiple
                value={filters.severity || []}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        color={getSeverityColor(value as AuditLog['severity'])}
                      />
                    ))}
                  </Box>
                )}
              >
                {['info', 'warning', 'error'].map((severity) => (
                  <MenuItem key={severity} value={severity}>
                    {severity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Transaction</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <Chip label={log.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.severity}
                      size="small"
                      color={getSeverityColor(log.severity)}
                    />
                  </TableCell>
                  <TableCell>{log.details.description}</TableCell>
                  <TableCell>
                    {log.details.transactionHash && (
                      <Tooltip title={log.details.transactionHash}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {`${log.details.transactionHash.slice(0, 6)}...${log.details.transactionHash.slice(-4)}`}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default React.memo(AuditLogs);
