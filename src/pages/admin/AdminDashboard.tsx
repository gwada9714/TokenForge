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
} from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Edit as EditIcon, Delete as DeleteIcon, Pause as PauseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';

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
    handleTogglePause,
    handleTransferOwnership
  } = useTokenForgeAdmin();
  const { address } = useAccount();
  
  // États pour les onglets et les dialogues
  const [tabValue, setTabValue] = useState(0);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Redirection si l'utilisateur n'est pas admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenTransferDialog = () => {
    setOpenTransferDialog(true);
  };

  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
    setNewOwnerAddress('');
  };

  const handleOwnershipTransfer = async () => {
    try {
      setError(null);
      await handleTransferOwnership(newOwnerAddress as `0x${string}`);
      handleCloseTransferDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* En-tête avec les onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Vue d'ensemble" />
          <Tab label="Contrôles Admin" />
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTogglePause}
                  startIcon={<PauseIcon />}
                >
                  Mettre en Pause / Reprendre
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleOpenTransferDialog}
                  startIcon={<EditIcon />}
                >
                  Transférer la Propriété
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
                        {process.env.VITE_CONTRACT_ADDRESS}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Adresse de l'Administrateur
                      </TableCell>
                      <TableCell>
                        {address}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialogue de transfert de propriété */}
      <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog}>
        <DialogTitle>Transférer la Propriété du Contrat</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Nouvelle Adresse Propriétaire"
            type="text"
            fullWidth
            value={newOwnerAddress}
            onChange={(e) => setNewOwnerAddress(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>Annuler</Button>
          <Button onClick={handleOwnershipTransfer} variant="contained" color="warning">
            Transférer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
