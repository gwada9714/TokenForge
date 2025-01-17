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
  CircularProgress,
} from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Edit as EditIcon, Delete as DeleteIcon, Pause as PauseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useContract } from '../../providers/ContractProvider';

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

  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
    setNewOwnerAddressInput('');
    setNewOwnerAddress(undefined);
  };

  const handleOwnershipTransfer = async () => {
    try {
      setErrorState(null);
      setNewOwnerAddress(newOwnerAddressInput as `0x${string}`);
      if (transferOwnership) {
        await transferOwnership();
        handleCloseTransferDialog();
      }
    } catch (err) {
      setErrorState(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (adminError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{adminError}</Alert>
      </Box>
    );
  }

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
                {pauseAvailable && (
                  <Button
                    variant="contained"
                    color={paused ? "success" : "warning"}
                    onClick={paused ? unpause : pause}
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

      {/* Dialogue de transfert de propriété */}
      <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog}>
        <DialogTitle>Transférer la Propriété du Contrat</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nouvelle adresse du propriétaire"
              value={newOwnerAddressInput}
              onChange={(e) => setNewOwnerAddressInput(e.target.value)}
              error={!!errorState}
              helperText={errorState}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>Annuler</Button>
          <Button 
            onClick={handleOwnershipTransfer}
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
    </Box>
  );
};

export default AdminDashboard;
