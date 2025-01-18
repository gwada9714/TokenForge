import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Alert,
  IconButton,
  Tooltip,
  MenuItem,
  CircularProgress,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Pause as PauseIcon, 
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Notifications as NotificationsIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useContract } from '../../contexts/ContractContext';
import { UI, TIMEOUTS, ERROR_MESSAGES } from '../../config/constants';
import { auditLogger, AuditActionType, AuditLog } from '../../services/auditLogger';
import { alertService, AlertRule } from '../../services/alertService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import jsPDF, { jsPDF as JSPDF } from 'jspdf';
import 'jspdf-autotable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    isAdmin,
    owner,
    paused,
    transferOwnership,
    pause,
    unpause,
    error: adminError,
    pauseAvailable,
    isPausing,
    isUnpausing,
    isTransferring,
    setNewOwnerAddress,
    isLoading: adminLoading,
  } = useTokenForgeAdmin();
  const { address } = useAccount();
  const { contractAddress, isLoading: contractLoading, error: contractError } = useContract();

  // États locaux (tous les hooks useState au début)
  const [tabValue, setTabValue] = useState(0);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [newOwnerAddressInput, setNewOwnerAddressInput] = useState('');
  const [errorState, setErrorState] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  const [confirmationDialog, setConfirmationDialog] = useState<{
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
  const [filterAction, setFilterAction] = useState<AuditActionType | ''>('');
  const [filterStatus, setFilterStatus] = useState<'SUCCESS' | 'FAILED' | ''>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<AuditActionType | null>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(alertService.getRules());
  const [newAlertRule, setNewAlertRule] = useState<Partial<AlertRule>>({
    actionType: AuditActionType.PAUSE,
    condition: 'both',
    enabled: true,
    notificationMessage: ''
  });
  const [detailFilters, setDetailFilters] = useState({
    dateRange: 'week', // week, month, year
    groupBy: 'day', // hour, day, week, month
    showSuccessOnly: false,
    showFailedOnly: false,
    searchTerm: '',
    minGas: '',
    maxGas: ''
  });

  // Gestion du chargement
  if (adminLoading || contractLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Gestion des erreurs
  if (errorState || adminError || contractError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {errorState || adminError || contractError}
        </Alert>
      </Box>
    );
  }

  // Vérification des droits d'admin
  if (!isAdmin) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Vous n'avez pas les droits d'administration nécessaires pour accéder à cette section.
        </Alert>
      </Box>
    );
  }

  const getActionStats = (action: AuditActionType) => {
    const logs = auditLogger.getLogs().filter(log => log.action === action);
    const successCount = logs.filter(log => log.details.status === 'SUCCESS').length;
    const failedCount = logs.filter(log => log.details.status === 'FAILED').length;
    
    return {
      'Total': logs.length,
      'Succès': successCount,
      'Échecs': failedCount,
      'Taux': logs.length ? `${(successCount / logs.length * 100).toFixed(1)}%` : '0%'
    };
  };

  const handleNotification = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleConfirmAction = async () => {
    try {
      await confirmationDialog.action();
      setConfirmationDialog(prev => ({ ...prev, open: false }));
    } catch (error) {
      console.error('Error during confirmation:', error);
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialog(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenTransferDialog = () => {
    setOpenTransferDialog(true);
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setNewOwnerAddressInput(value);
    setErrorState(null);
  };

  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
    setNewOwnerAddressInput('');
    setErrorState(null);
  };

  const handlePauseToggle = () => {
    const action = paused ? unpause : pause;
    const actionName = paused ? 'réactiver' : 'mettre en pause';
    
    setConfirmationDialog({
      open: true,
      title: `Confirmation - ${paused ? 'Réactivation' : 'Mise en Pause'} du Contrat`,
      message: `Êtes-vous sûr de vouloir ${actionName} le contrat ? Cette action affectera toutes les opérations en cours.`,
      action: async () => {
        try {
          handleNotification('Transaction en cours...', 'info');
          await action();
          handleNotification(`Le contrat a été ${paused ? 'réactivé' : 'mis en pause'} avec succès.`, 'success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Une erreur est survenue';
          handleNotification(message, 'error');
          throw error;
        }
      }
    });
  };

  const handleTransferOwnership = async () => {
    if (!transferOwnership) {
      setErrorState(ERROR_MESSAGES.CONTRACT.NOT_OWNER);
      return;
    }

    try {
      const address = newOwnerAddressInput.trim();
      
      if (!address) {
        throw new Error(ERROR_MESSAGES.VALIDATION.EMPTY_ADDRESS);
      }

      if (!address.startsWith('0x') || address.length !== 42) {
        throw new Error(ERROR_MESSAGES.VALIDATION.INVALID_ADDRESS);
      }

      setConfirmationDialog({
        open: true,
        title: 'Confirmation - Transfert de Propriété',
        message: `Êtes-vous sûr de vouloir transférer la propriété du contrat à l'adresse ${address} ? Cette action est irréversible.`,
        action: async () => {
          try {
            handleNotification('Transaction en cours...', 'info');
            await transferOwnership(address);
            handleNotification('La propriété a été transférée avec succès.', 'success');
            handleCloseTransferDialog();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Une erreur est survenue';
            handleNotification(message, 'error');
            throw error;
          }
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      setErrorState(message);
    }
  };

  const getFilteredLogs = () => {
    const logs = auditLogger.getLogs();
    return logs.filter(log => {
      const actionMatch = filterAction === '' || log.action === filterAction;
      const statusMatch = filterStatus === '' || log.details.status === filterStatus;
      const startDateMatch = filterStartDate === '' || new Date(log.timestamp) >= new Date(filterStartDate);
      const endDateMatch = filterEndDate === '' || new Date(log.timestamp) <= new Date(filterEndDate);
      return actionMatch && statusMatch && startDateMatch && endDateMatch;
    });
  };

  const handleResetFilters = () => {
    setFilterAction('');
    setFilterStatus('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const handleExportLogs = () => {
    const logs = getFilteredLogs();
    const csv = logs.map(log => {
      return [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.details.status,
        log.details.transactionHash || '',
        log.details.targetAddress || '',
        log.details.error || '',
        log.details.networkInfo.networkName
      ].join(',');
    }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    const logs = auditLogger.getLogs();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      total: logs.filter(log => log.timestamp.startsWith(date)).length,
      success: logs.filter(log => log.timestamp.startsWith(date) && log.details.status === 'SUCCESS').length,
      failed: logs.filter(log => log.timestamp.startsWith(date) && log.details.status === 'FAILED').length
    }));
  };

  const getPieChartData = () => {
    const logs = auditLogger.getLogs();
    return Object.values(AuditActionType).map(action => ({
      name: action,
      value: logs.filter(log => log.action === action).length
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const handlePurgeLogs = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous les logs ? Cette action est irréversible.')) {
      auditLogger.clearLogs();
      handleNotification('Logs supprimés avec succès', 'success');
    }
  };

  const handleAddAlertRule = () => {
    if (!newAlertRule.notificationMessage) return;

    const rule = alertService.addRule({
      actionType: newAlertRule.actionType as AuditActionType,
      condition: newAlertRule.condition as 'success' | 'failed' | 'both',
      enabled: true,
      notificationMessage: newAlertRule.notificationMessage
    });

    setAlertRules(alertService.getRules());
    setOpenAlertDialog(false);
    setNewAlertRule({
      actionType: AuditActionType.PAUSE,
      condition: 'both',
      enabled: true,
      notificationMessage: ''
    });
  };

  const handleToggleAlertRule = (id: string, enabled: boolean) => {
    alertService.updateRule(id, { enabled });
    setAlertRules(alertService.getRules());
  };

  const handleDeleteAlertRule = (id: string) => {
    alertService.deleteRule(id);
    setAlertRules(alertService.getRules());
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(16);
    doc.text('Rapport d\'Audit TokenForge', 20, 20);
    doc.setFontSize(12);
    doc.text(`Généré le ${new Date().toLocaleString()}`, 20, 30);

    // Statistiques globales
    const logs = auditLogger.getLogs();
    const stats = {
      total: logs.length,
      success: logs.filter(log => log.details.status === 'SUCCESS').length,
      failed: logs.filter(log => log.details.status === 'FAILED').length
    };

    doc.text('Statistiques Globales:', 20, 45);
    doc.text(`Total des actions: ${stats.total}`, 30, 55);
    doc.text(`Actions réussies: ${stats.success}`, 30, 62);
    doc.text(`Actions échouées: ${stats.failed}`, 30, 69);

    // Table des actions par type
    const tableData = Object.values(AuditActionType).map(action => {
      const actionLogs = logs.filter(log => log.action === action);
      const successCount = actionLogs.filter(log => log.details.status === 'SUCCESS').length;
      const failedCount = actionLogs.filter(log => log.details.status === 'FAILED').length;
      const successRate = actionLogs.length ? (successCount / actionLogs.length * 100).toFixed(1) : '0';
      
      return [
        action,
        actionLogs.length.toString(),
        successCount.toString(),
        failedCount.toString(),
        `${successRate}%`
      ];
    });

    doc.autoTable({
      head: [['Type d\'Action', 'Total', 'Succès', 'Échecs', 'Taux de Succès']],
      body: tableData,
      startY: 80
    });

    doc.save('tokenforge-audit-report.pdf');
  };

  const getDetailedChartData = () => {
    const logs = auditLogger.getLogs()
      .filter(log => {
        if (detailFilters.showSuccessOnly && log.details.status !== 'SUCCESS') return false;
        if (detailFilters.showFailedOnly && log.details.status !== 'FAILED') return false;
        if (detailFilters.searchTerm && !log.action.toLowerCase().includes(detailFilters.searchTerm.toLowerCase())) return false;
        return true;
      });

    const now = new Date();
    let startDate = new Date();
    let interval: number;

    switch (detailFilters.dateRange) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        interval = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      default: // week
        startDate.setDate(now.getDate() - 7);
        interval = 24 * 60 * 60 * 1000; // 1 day
    }

    const timePoints: Date[] = [];
    for (let d = new Date(startDate); d <= now; d.setTime(d.getTime() + interval)) {
      timePoints.push(new Date(d));
    }

    return timePoints.map(date => {
      const nextDate = new Date(date.getTime() + interval);
      const periodLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= date && logDate < nextDate;
      });

      return {
        date: date.toLocaleDateString(),
        total: periodLogs.length,
        success: periodLogs.filter(log => log.details.status === 'SUCCESS').length,
        failed: periodLogs.filter(log => log.details.status === 'FAILED').length,
        avgGas: periodLogs.reduce((sum, log) => sum + (log.details.gasUsed || 0), 0) / (periodLogs.length || 1)
      };
    });
  };

  const getHourlyDistribution = () => {
    const logs = auditLogger.getLogs();
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: hour.toString().padStart(2, '0') + 'h',
      count: 0
    }));

    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyData[hour].count++;
    });

    return hourlyData;
  };

  const handleExportAlertConfig = () => {
    const config = alertService.exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tokenforge-alert-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAlertConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (alertService.importConfig(content)) {
        setAlertRules(alertService.getRules());
        handleNotification('Configuration importée avec succès', 'success');
      } else {
        handleNotification('Erreur lors de l\'import de la configuration', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleActionClick = (action: AuditActionType) => {
    setSelectedAction(action);
  };

  return (
    <Box p={3}>
      <Paper elevation={3}>
        <Box p={3}>
          <Typography variant="h4" gutterBottom>
            Dashboard Administrateur
          </Typography>
          
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    État du Contrat
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Adresse du contrat"
                        secondary={contractAddress || 'Non disponible'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Propriétaire"
                        secondary={owner || 'Non disponible'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="État"
                        secondary={paused ? 'En pause' : 'Actif'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Actions
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Button
                      variant="contained"
                      color={paused ? "success" : "warning"}
                      onClick={() => paused ? unpause() : pause()}
                      disabled={isPausing || isUnpausing}
                      startIcon={paused ? <PlayArrowIcon /> : <PauseIcon />}
                      fullWidth
                    >
                      {paused ? "Réactiver le contrat" : "Mettre en pause le contrat"}
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => setOpenTransferDialog(true)}
                      disabled={isTransferring}
                      startIcon={<EditIcon />}
                      fullWidth
                    >
                      Transférer la propriété
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Dialog de transfert de propriété */}
      <Dialog open={openTransferDialog} onClose={() => setOpenTransferDialog(false)}>
        <DialogTitle>Transférer la propriété du contrat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nouvelle adresse du propriétaire"
            type="text"
            fullWidth
            value={newOwnerAddressInput}
            onChange={(e) => setNewOwnerAddressInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransferDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleTransferOwnership}
            disabled={isTransferring}
          >
            Transférer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
