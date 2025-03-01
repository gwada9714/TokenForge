import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Chip,
  TablePagination,
  Box,
  useTheme
} from '@mui/material';
import { 
  Info as InfoIcon, 
  Warning as WarningIcon, 
  Error as ErrorIcon 
} from '@mui/icons-material';

// Types pour les logs d'audit
interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  details?: string;
}

/**
 * Composant affichant les logs d'audit
 * Permet de visualiser les actions des utilisateurs dans le système
 */
export const AuditLogs: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Données de démonstration
  const logs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2025-03-01T14:32:21',
      user: 'admin@tokenforge.com',
      action: 'Création de token',
      resource: 'TokenFactory',
      status: 'success',
      details: 'Token ERC-20 "DEMO" créé avec succès'
    },
    {
      id: '2',
      timestamp: '2025-03-01T13:45:12',
      user: 'user1@example.com',
      action: 'Connexion',
      resource: 'AuthService',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2025-03-01T12:22:45',
      user: 'user2@example.com',
      action: 'Paiement',
      resource: 'PaymentService',
      status: 'error',
      details: 'Transaction échouée: solde insuffisant'
    },
    {
      id: '4',
      timestamp: '2025-03-01T11:15:33',
      user: 'admin@tokenforge.com',
      action: 'Modification de paramètres',
      resource: 'SystemSettings',
      status: 'success',
      details: 'Frais de service mis à jour'
    },
    {
      id: '5',
      timestamp: '2025-03-01T10:05:18',
      user: 'user3@example.com',
      action: 'Déploiement de contrat',
      resource: 'ContractService',
      status: 'warning',
      details: 'Déploiement réussi mais avec des avertissements'
    },
    {
      id: '6',
      timestamp: '2025-03-01T09:42:51',
      user: 'user1@example.com',
      action: 'Création de token',
      resource: 'TokenFactory',
      status: 'success',
      details: 'Token ERC-20 "TEST" créé avec succès'
    },
    {
      id: '7',
      timestamp: '2025-03-01T08:30:22',
      user: 'system',
      action: 'Maintenance',
      resource: 'System',
      status: 'success',
      details: 'Maintenance planifiée terminée'
    }
  ];

  // Gestion de la pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Fonction pour obtenir l'icône en fonction du statut
  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <InfoIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
    }
  };

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
    }
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="audit logs table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Ressource</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Détails</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow
                  key={log.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {formatDate(log.timestamp)}
                  </TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(log.status)}
                      label={log.status}
                      color={getStatusColor(log.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {log.details || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={logs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};
