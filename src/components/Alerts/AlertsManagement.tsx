import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { AlertType, AlertRule, useAlertManagement } from '../../hooks/useAlertManagement';

export const AlertsManagement: React.FC = () => {
  const {
    rules,
    history,
    addRule,
    removeRule,
    toggleRule,
    exportRules,
    importRules,
    clearHistory,
  } = useAlertManagement();

  const [openDialog, setOpenDialog] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [newRule, setNewRule] = useState<Omit<AlertRule, 'id'>>({
    type: 'info',
    pattern: '',
    message: '',
    enabled: true,
    autoClose: true,
    duration: 5000,
  });

  // Gérer l'ajout d'une nouvelle règle
  const handleAddRule = () => {
    if (newRule.pattern && newRule.message) {
      addRule(newRule);
      setOpenDialog(false);
      setNewRule({
        type: 'info',
        pattern: '',
        message: '',
        enabled: true,
        autoClose: true,
        duration: 5000,
      });
    }
  };

  // Gérer l'import de règles
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importRules(content)) {
          alert('Règles importées avec succès');
        } else {
          alert('Erreur lors de l\'import des règles');
        }
      };
      reader.readAsText(file);
    }
  };

  // Gérer l'export des règles
  const handleExport = () => {
    const content = exportRules();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alert-rules.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Gestion des alertes"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Historique des alertes">
                <IconButton onClick={() => setOpenHistory(true)}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Importer des règles">
                <IconButton component="label">
                  <ImportIcon />
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImport}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exporter les règles">
                <IconButton onClick={handleExport}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Nouvelle règle
              </Button>
            </Box>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Pattern</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell align="center">Actif</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>{rule.type}</TableCell>
                    <TableCell>{rule.pattern}</TableCell>
                    <TableCell>{rule.message}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => removeRule(rule.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog pour ajouter une nouvelle règle */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nouvelle règle d'alerte</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newRule.type}
                label="Type"
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    type: e.target.value as AlertType,
                  }))
                }
              >
                <MenuItem value="info">Information</MenuItem>
                <MenuItem value="success">Succès</MenuItem>
                <MenuItem value="warning">Avertissement</MenuItem>
                <MenuItem value="error">Erreur</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Pattern (RegExp)"
              value={newRule.pattern}
              onChange={(e) =>
                setNewRule((prev) => ({ ...prev, pattern: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Message"
              value={newRule.message}
              onChange={(e) =>
                setNewRule((prev) => ({ ...prev, message: e.target.value }))
              }
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Durée (ms)"
              type="number"
              value={newRule.duration}
              onChange={(e) =>
                setNewRule((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value),
                }))
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleAddRule} variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour l'historique */}
      <Dialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Historique des alertes
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                clearHistory();
                setOpenHistory(false);
              }}
            >
              Nettoyer
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {history.map((alert, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme =>
                      alert.type === 'error'
                        ? theme.palette.error.main
                        : alert.type === 'warning'
                        ? theme.palette.warning.main
                        : alert.type === 'success'
                        ? theme.palette.success.main
                        : theme.palette.info.main,
                  }}
                >
                  {alert.message}
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistory(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
