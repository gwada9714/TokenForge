import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLog {
  id: string;
  timestamp: number;
  action: string;
  userId: string;
  details: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);

  React.useEffect(() => {
    // TODO: Implémenter la récupération des logs depuis le backend
    const fetchLogs = async () => {
      try {
        // Simulation de données pour le moment
        const mockLogs: AuditLog[] = [
          {
            id: '1',
            timestamp: Date.now(),
            action: 'TOKEN_CREATION',
            userId: 'user123',
            details: 'Création d\'un nouveau token'
          },
          // Ajoutez d'autres logs simulés ici
        ];
        setLogs(mockLogs);
      } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Utilisateur</TableCell>
            <TableCell>Détails</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {format(log.timestamp, 'Pp', { locale: fr })}
              </TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.userId}</TableCell>
              <TableCell>{log.details}</TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography align="center">
                  Aucun log d'audit disponible
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
