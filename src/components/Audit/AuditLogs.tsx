import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { LogLevel, LogCategory, useAuditLogs } from '../../hooks/useAuditLogs';

const LOG_LEVELS: LogLevel[] = ['info', 'warning', 'error', 'critical'];
const LOG_CATEGORIES: LogCategory[] = ['security', 'transaction', 'network', 'contract', 'system'];

const getLevelColor = (level: LogLevel): string => {
  switch (level) {
    case 'critical':
      return '#d32f2f';
    case 'error':
      return '#f44336';
    case 'warning':
      return '#ff9800';
    case 'info':
    default:
      return '#2196f3';
  }
};

export const AuditLogs: React.FC = () => {
  const {
    filteredLogs,
    filters,
    updateFilters,
    resetFilters,
    clearLogs,
    exportLogs,
    purgeLogs,
  } = useAuditLogs();

  const [openFilters, setOpenFilters] = useState(false);
  const [openPurge, setOpenPurge] = useState(false);
  const [openClear, setOpenClear] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(30);

  // Gérer l'export des logs
  const handleExport = (format: 'json' | 'csv') => {
    const content = exportLogs(format);
    const type = format === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Gérer la purge des logs
  const handlePurge = () => {
    purgeLogs(daysToKeep);
    setOpenPurge(false);
  };

  // Gérer le nettoyage complet des logs
  const handleClearLogs = () => {
    clearLogs();
    setOpenClear(false);
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Logs d'audit"
          action={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Filtrer">
                <IconButton onClick={() => setOpenFilters(true)}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exporter (JSON)">
                <IconButton onClick={() => handleExport('json')}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Purger les anciens logs">
                <IconButton onClick={() => setOpenPurge(true)} color="warning">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Effacer tous les logs">
                <IconButton onClick={() => setOpenClear(true)} color="error">
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
            </Stack>
          }
        />
        <CardContent>
          {/* Filtres actifs */}
          {Object.keys(filters).length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.level?.map(level => (
                <Chip
                  key={level}
                  label={`Niveau: ${level}`}
                  onDelete={() =>
                    updateFilters({
                      level: filters.level?.filter(l => l !== level),
                    })
                  }
                />
              ))}
              {filters.category?.map(category => (
                <Chip
                  key={category}
                  label={`Catégorie: ${category}`}
                  onDelete={() =>
                    updateFilters({
                      category: filters.category?.filter(c => c !== category),
                    })
                  }
                />
              ))}
              {filters.searchText && (
                <Chip
                  label={`Recherche: ${filters.searchText}`}
                  onDelete={() => updateFilters({ searchText: undefined })}
                />
              )}
            </Box>
          )}

          {/* Tableau des logs */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Détails</TableCell>
                  <TableCell>Adresse</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.level}
                        size="small"
                        sx={{
                          bgcolor: getLevelColor(log.level),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>{log.category}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>
                      {log.address && (
                        <Tooltip title={log.address}>
                          <Typography variant="body2" noWrap>
                            {`${log.address.slice(0, 6)}...${log.address.slice(-4)}`}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog des filtres */}
      <Dialog open={openFilters} onClose={() => setOpenFilters(false)}>
        <DialogTitle>Filtrer les logs</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Niveau</InputLabel>
              <Select
                multiple
                value={filters.level || []}
                label="Niveau"
                onChange={e => updateFilters({ level: e.target.value as LogLevel[] })}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {LOG_LEVELS.map(level => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                multiple
                value={filters.category || []}
                label="Catégorie"
                onChange={e => updateFilters({ category: e.target.value as LogCategory[] })}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {LOG_CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date de début"
              type="date"
              value={filters.startDate?.toISOString().split('T')[0] || ''}
              onChange={e => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                updateFilters({ startDate: date });
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Date de fin"
              type="date"
              value={filters.endDate?.toISOString().split('T')[0] || ''}
              onChange={e => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                updateFilters({ endDate: date });
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Recherche"
              value={filters.searchText || ''}
              onChange={e => updateFilters({ searchText: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilters(false)}>Fermer</Button>
          <Button onClick={resetFilters} color="error">
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de purge */}
      <Dialog open={openPurge} onClose={() => setOpenPurge(false)}>
        <DialogTitle>Purger les anciens logs</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Jours à conserver"
              type="number"
              value={daysToKeep}
              onChange={e => setDaysToKeep(parseInt(e.target.value))}
              fullWidth
              helperText="Les logs plus anciens seront supprimés définitivement"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPurge(false)}>Annuler</Button>
          <Button onClick={handlePurge} color="error" variant="contained">
            Purger
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation pour effacer tous les logs */}
      <Dialog open={openClear} onClose={() => setOpenClear(false)}>
        <DialogTitle>Effacer tous les logs</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir effacer tous les logs ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClear(false)}>Annuler</Button>
          <Button onClick={handleClearLogs} color="error" variant="contained">
            Effacer tout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
