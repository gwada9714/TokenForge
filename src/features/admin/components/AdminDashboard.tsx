import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { AuditLogs } from './AuditLogs';
import { TokenStats } from './TokenStats';
import { UserManagement } from './UserManagement';

export const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tableau de bord administrateur
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Statistiques des tokens
            </Typography>
            <TokenStats />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gestion des utilisateurs
            </Typography>
            <UserManagement />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Logs d'audit
            </Typography>
            <AuditLogs />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
