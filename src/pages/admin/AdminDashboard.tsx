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
import { useContract } from '../../providers/ContractProvider';
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
import jsPDF from 'jspdf';
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
    isLoading,
  } = useTokenForgeAdmin();
  const { address } = useAccount();
  const { contractAddress } = useContract();
  
  // États pour les onglets et les dialogues
  const [tabValue, setTabValue] = useState(0);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [newOwnerAddressInput, setNewOwnerAddressInput] = useState('');
  const [errorState, setErrorState] = useState<string | null>(null);

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

  // Gestionnaire de notification
  const handleNotification = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fermeture de la notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Gestionnaire de confirmation
  const handleConfirmAction = async () => {
    try {
      await confirmationDialog.action();
      setConfirmationDialog(prev => ({ ...prev, open: false }));
    } catch (error) {
      console.error('Error during confirmation:', error);
    }
  };

  // Fermeture du dialogue de confirmation
  const handleCloseConfirmation = () => {
    setConfirmationDialog(prev => ({ ...prev, open: false }));
  };

  // Si le contrat est en cours de chargement, afficher un indicateur
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirection si l'utilisateur n'est pas admin
  React.useEffect(() => {
    if (!isAdmin && owner !== undefined) {
      navigate('/');
    }
  }, [isAdmin, navigate, owner]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenTransferDialog = () => {
    setOpenTransferDialog(true);
  };

  // Gestionnaire de changement d'adresse
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

  // Gestionnaire de pause/unpause avec confirmation
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

  // Modification du gestionnaire de transfert
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

  const [filterAction, setFilterAction] = useState<AuditActionType | ''>('');
  const [filterStatus, setFilterStatus] = useState<'SUCCESS' | 'FAILED' | ''>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

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

  // Fonction pour obtenir les données du graphique
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

  // Données pour le graphique en camembert
  const getPieChartData = () => {
    const logs = auditLogger.getLogs();
    return Object.values(AuditActionType).map(action => ({
      name: action,
      value: logs.filter(log => log.action === action).length
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Fonction pour purger les logs
  const handlePurgeLogs = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous les logs ? Cette action est irréversible.')) {
      auditLogger.clearLogs();
      handleNotification('Logs supprimés avec succès', 'success');
    }
  };

  const [selectedAction, setSelectedAction] = useState<AuditActionType | null>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(alertService.getRules());
  const [newAlertRule, setNewAlertRule] = useState<Partial<AlertRule>>({
    actionType: AuditActionType.PAUSE,
    condition: 'both',
    enabled: true,
    notificationMessage: ''
  });

  // Fonction pour exporter en PDF
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

  // Gestion des alertes
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

  // État pour les filtres détaillés
  const [detailFilters, setDetailFilters] = useState({
    dateRange: 'week', // week, month, year
    groupBy: 'day', // hour, day, week, month
    showSuccessOnly: false,
    showFailedOnly: false,
    searchTerm: '',
    minGas: '',
    maxGas: ''
  });

  // Fonction pour obtenir les données détaillées du graphique
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

  // Fonction pour obtenir les données de distribution horaire
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

  // Fonction pour exporter la configuration des alertes
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

  // Fonction pour importer la configuration des alertes
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

  // Vue détaillée
  const handleActionClick = (action: AuditActionType) => {
    setSelectedAction(action);
  };

  if (adminError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{adminError}</Alert>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        {/* En-tête avec les onglets */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Vue d'ensemble" />
            <Tab label="Contrôles Admin" />
            <Tab label="Logs d'Audit" />
          </Tabs>
        </Box>

        {/* Panneau Vue d'ensemble */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Statut Administrateur
                  </Typography>
                  <Typography variant="body1">
                    Vous êtes connecté en tant qu'administrateur avec l'adresse : {address}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panneau Contrôles Admin */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Contrôles du Contrat
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  {pauseAvailable && (
                    <Button
                      variant="contained"
                      color={paused ? "success" : "warning"}
                      onClick={handlePauseToggle}
                      startIcon={paused ? <PlayArrowIcon /> : <PauseIcon />}
                      disabled={isPausing || isUnpausing}
                    >
                      {isPausing || isUnpausing ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : paused ? (
                        'Reprendre'
                      ) : (
                        'Mettre en Pause'
                      )}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleOpenTransferDialog}
                    startIcon={<EditIcon />}
                    disabled={isTransferring}
                  >
                    {isTransferring ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Transférer la Propriété'
                    )}
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Informations du Contrat
                </Typography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Adresse du Contrat
                        </TableCell>
                        <TableCell>
                          {contractAddress}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Adresse de l'Administrateur
                        </TableCell>
                        <TableCell>
                          {owner}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          État du Contrat
                        </TableCell>
                        <TableCell>
                          {paused ? 'En Pause' : 'Actif'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panneau Logs d'Audit */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Statistiques */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total des Actions
                    </Typography>
                    <Typography variant="h6">
                      {auditLogger.getLogs().length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Taux de Succès
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {Math.round((auditLogger.getLogs().filter(log => log.details.status === 'SUCCESS').length / 
                        (auditLogger.getLogs().length || 1)) * 100)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dernière Action
                    </Typography>
                    <Typography variant="h6">
                      {auditLogger.getLogs()[0]?.action || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Actions Aujourd'hui
                    </Typography>
                    <Typography variant="h6">
                      {auditLogger.getLogs().filter(log => 
                        new Date(log.timestamp).toDateString() === new Date().toDateString()
                      ).length}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Filtres et Export */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      fullWidth
                      label="Type d'Action"
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value as AuditActionType | '')}
                      size="small"
                    >
                      <MenuItem value="">Toutes les actions</MenuItem>
                      {Object.values(AuditActionType).map((action) => (
                        <MenuItem key={action} value={action}>
                          {action}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      fullWidth
                      label="Statut"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'SUCCESS' | 'FAILED' | '')}
                      size="small"
                    >
                      <MenuItem value="">Tous les statuts</MenuItem>
                      <MenuItem value="SUCCESS">Succès</MenuItem>
                      <MenuItem value="FAILED">Échec</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      type="date"
                      fullWidth
                      label="Date Début"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      type="date"
                      fullWidth
                      label="Date Fin"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    startIcon={<FilterListIcon />}
                    onClick={handleResetFilters}
                    size="small"
                  >
                    Réinitialiser les filtres
                  </Button>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={handleExportLogs}
                    size="small"
                  >
                    Exporter les logs
                  </Button>
                  <Button
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPDF}
                    size="small"
                  >
                    Exporter en PDF
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Graphiques */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Activité des 7 derniers jours
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
                    <Line type="monotone" dataKey="success" stroke="#82ca9d" name="Succès" />
                    <Line type="monotone" dataKey="failed" stroke="#ff7300" name="Échecs" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Distribution des Actions */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Distribution des Actions
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPieChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPieChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Statistiques Détaillées */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Statistiques Détaillées par Type d'Action
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type d'Action</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Succès</TableCell>
                        <TableCell align="right">Échecs</TableCell>
                        <TableCell align="right">Taux de Succès</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.values(AuditActionType).map(action => {
                        const actionLogs = auditLogger.getLogs().filter(log => log.action === action);
                        const successCount = actionLogs.filter(log => log.details.status === 'SUCCESS').length;
                        const failedCount = actionLogs.filter(log => log.details.status === 'FAILED').length;
                        const successRate = actionLogs.length ? (successCount / actionLogs.length * 100).toFixed(1) : '0';
                        
                        return (
                          <TableRow key={action}>
                            <TableCell>{action}</TableCell>
                            <TableCell align="right">{actionLogs.length}</TableCell>
                            <TableCell align="right">{successCount}</TableCell>
                            <TableCell align="right">{failedCount}</TableCell>
                            <TableCell align="right">{successRate}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Table des Logs */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Historique des Actions Administratives
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Détails</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredLogs().map((log: AuditLog, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => handleActionClick(log.action)}>
                              {log.action}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Typography
                              color={log.details.status === 'SUCCESS' ? 'success.main' : 'error.main'}
                            >
                              {log.details.status}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={
                              <div>
                                {log.details.transactionHash && (
                                  <p>Transaction: {log.details.transactionHash}</p>
                                )}
                                {log.details.targetAddress && (
                                  <p>Adresse cible: {log.details.targetAddress}</p>
                                )}
                                {log.details.error && (
                                  <p>Erreur: {log.details.error}</p>
                                )}
                                <p>Réseau: {log.details.networkInfo.networkName}</p>
                              </div>
                            }>
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
              </Paper>
            </Grid>

            {/* Boutons d'action */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenAlertDialog(true)}
                  startIcon={<NotificationsIcon />}
                >
                  Gérer les Alertes
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handlePurgeLogs}
                  startIcon={<DeleteIcon />}
                >
                  Purger les Logs
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Dialogue de transfert de propriété */}
        <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog}>
          <DialogTitle>Transférer la Propriété du Contrat</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nouvelle adresse du propriétaire"
                value={newOwnerAddressInput}
                onChange={handleAddressChange}
                error={!!errorState}
                helperText={errorState}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTransferDialog}>Annuler</Button>
            <Button 
              onClick={handleTransferOwnership}
              disabled={!newOwnerAddressInput || isTransferring}
              color="primary"
            >
              {isTransferring ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Transférer'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialogue de confirmation */}
        <Dialog open={confirmationDialog.open} onClose={handleCloseConfirmation}>
          <DialogTitle>{confirmationDialog.title}</DialogTitle>
          <DialogContent>
            <Typography>{confirmationDialog.message}</Typography>
            <Typography color="error" sx={{ mt: 2 }}>
              Cette action nécessite une confirmation de transaction sur votre wallet.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmation}>Annuler</Button>
            <Button onClick={handleConfirmAction} color="error" variant="contained">
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Vue détaillée d'une action */}
        <Dialog
          open={!!selectedAction}
          onClose={() => setSelectedAction(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Détails de l'Action: {selectedAction}
          </DialogTitle>
          <DialogContent>
            {selectedAction && (
              <>
                {/* Filtres avancés */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Filtres Avancés
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        fullWidth
                        label="Période"
                        value={detailFilters.dateRange}
                        onChange={(e) => setDetailFilters(prev => ({
                          ...prev,
                          dateRange: e.target.value
                        }))}
                        size="small"
                      >
                        <MenuItem value="week">7 derniers jours</MenuItem>
                        <MenuItem value="month">30 derniers jours</MenuItem>
                        <MenuItem value="year">12 derniers mois</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        fullWidth
                        label="Grouper par"
                        value={detailFilters.groupBy}
                        onChange={(e) => setDetailFilters(prev => ({
                          ...prev,
                          groupBy: e.target.value
                        }))}
                        size="small"
                      >
                        <MenuItem value="hour">Heure</MenuItem>
                        <MenuItem value="day">Jour</MenuItem>
                        <MenuItem value="week">Semaine</MenuItem>
                        <MenuItem value="month">Mois</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Rechercher"
                        value={detailFilters.searchTerm}
                        onChange={(e) => setDetailFilters(prev => ({
                          ...prev,
                          searchTerm: e.target.value
                        }))}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={detailFilters.showSuccessOnly}
                            onChange={(e) => setDetailFilters(prev => ({
                              ...prev,
                              showSuccessOnly: e.target.checked,
                              showFailedOnly: false
                            }))}
                          />
                        }
                        label="Succès uniquement"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={detailFilters.showFailedOnly}
                            onChange={(e) => setDetailFilters(prev => ({
                              ...prev,
                              showFailedOnly: e.target.checked,
                              showSuccessOnly: false
                            }))}
                          />
                        }
                        label="Échecs uniquement"
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Graphiques détaillés */}
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Évolution Temporelle
                    </Typography>
                    <Paper sx={{ p: 2, height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={getDetailedChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Area type="monotone" dataKey="success" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Succès" />
                          <Area type="monotone" dataKey="failed" stackId="1" stroke="#ff7300" fill="#ff7300" name="Échecs" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Distribution Horaire
                    </Typography>
                    <Paper sx={{ p: 2, height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={getHourlyDistribution()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#8884d8" name="Nombre d'actions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Statistiques existantes */}
                <Box sx={{ mb: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Statistiques
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(getActionStats(selectedAction)).map(([key, value]) => (
                      <Grid item xs={6} sm={3} key={key}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {key}
                          </Typography>
                          <Typography variant="h6">
                            {value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialogue de gestion des alertes */}
        <Dialog
          open={openAlertDialog}
          onClose={() => setOpenAlertDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Gérer les Alertes
              <Box>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  id="alert-config-file"
                  onChange={handleImportAlertConfig}
                />
                <label htmlFor="alert-config-file">
                  <Button
                    component="span"
                    startIcon={<UploadIcon />}
                    size="small"
                  >
                    Importer
                  </Button>
                </label>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={handleExportAlertConfig}
                  size="small"
                >
                  Exporter
                </Button>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Nouvelle Alerte
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Type d'Action"
                    value={newAlertRule.actionType}
                    onChange={(e) => setNewAlertRule(prev => ({
                      ...prev,
                      actionType: e.target.value as AuditActionType
                    }))}
                  >
                    {Object.values(AuditActionType).map((action) => (
                      <MenuItem key={action} value={action}>
                        {action}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Condition"
                    value={newAlertRule.condition}
                    onChange={(e) => setNewAlertRule(prev => ({
                      ...prev,
                      condition: e.target.value as 'success' | 'failed' | 'both'
                    }))}
                  >
                    <MenuItem value="success">Succès uniquement</MenuItem>
                    <MenuItem value="failed">Échecs uniquement</MenuItem>
                    <MenuItem value="both">Les deux</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message de notification"
                    value={newAlertRule.notificationMessage}
                    onChange={(e) => setNewAlertRule(prev => ({
                      ...prev,
                      notificationMessage: e.target.value
                    }))}
                  />
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddAlertRule}
                sx={{ mt: 2 }}
              >
                Ajouter l'Alerte
              </Button>
            </Box>

            <Typography variant="h6" gutterBottom>
              Alertes Existantes
            </Typography>
            <List>
              {alertRules.map((rule) => (
                <ListItem
                  key={rule.id}
                  secondaryAction={
                    <Box>
                      <Switch
                        edge="end"
                        checked={rule.enabled}
                        onChange={(e) => handleToggleAlertRule(rule.id, e.target.checked)}
                      />
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteAlertRule(rule.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={rule.actionType}
                    secondary={`${rule.condition} - ${rule.notificationMessage}`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAlertDialog(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={UI.NOTIFICATIONS.AUTO_HIDE_DURATION}
        onClose={handleCloseSnackbar}
        anchorOrigin={UI.NOTIFICATIONS.POSITION}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminDashboard;
