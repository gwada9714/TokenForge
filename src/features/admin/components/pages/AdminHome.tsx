import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { AuditLogs } from '../AuditLogs';
import { TokenStats } from '../TokenStats';
import { UserManagement } from '../UserManagement';
import { SystemStatus, SystemStatusProps } from '../SystemStatus';
import { TokenDistributionChart, TokenDistributionChartProps } from '../TokenDistributionChart';
import { UserActivityChart, UserActivityChartProps } from '../UserActivityChart';

/**
 * Page d'accueil du dashboard administrateur
 * Affiche les différentes statistiques et widgets
 */
export const AdminHome: React.FC = () => {
  // Données pour SystemStatus
  const systemStatus: SystemStatusProps['status'] = {
    server: 'online',
    database: 'online',
    blockchain: {
      ethereum: 'online',
      binance: 'online',
      polygon: 'online',
      avalanche: 'degraded',
      solana: 'online'
    },
    cache: 'online',
    queue: 'online'
  };

  // Données pour TokenDistributionChart
  const tokenDistribution: TokenDistributionChartProps['data'] = [
    { name: 'Ethereum', value: 4000, color: '#627EEA' },
    { name: 'Binance', value: 3000, color: '#F3BA2F' },
    { name: 'Polygon', value: 2000, color: '#8247E5' },
    { name: 'Avalanche', value: 1500, color: '#E84142' },
    { name: 'Solana', value: 1000, color: '#00FFA3' }
  ];

  // Données pour UserActivityChart
  const userActivity: UserActivityChartProps['data'] = [
    { date: '01/03', logins: 40, tokenCreations: 24, transactions: 10 },
    { date: '02/03', logins: 30, tokenCreations: 13, transactions: 23 },
    { date: '03/03', logins: 20, tokenCreations: 98, transactions: 45 },
    { date: '04/03', logins: 27, tokenCreations: 39, transactions: 28 },
    { date: '05/03', logins: 18, tokenCreations: 48, transactions: 19 },
    { date: '06/03', logins: 23, tokenCreations: 38, transactions: 42 },
    { date: '07/03', logins: 34, tokenCreations: 43, transactions: 30 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tableau de bord administrateur
          </Typography>
        </Grid>
        
        {/* System Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              État du système
            </Typography>
            <SystemStatus status={systemStatus} />
          </Paper>
        </Grid>
        
        {/* Token Statistics */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Statistiques des tokens
            </Typography>
            <TokenStats />
          </Paper>
        </Grid>

        {/* User Management */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gestion des utilisateurs
            </Typography>
            <UserManagement />
          </Paper>
        </Grid>
        
        {/* Token Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution des tokens
            </Typography>
            <TokenDistributionChart data={tokenDistribution} />
          </Paper>
        </Grid>
        
        {/* User Activity Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activité des utilisateurs
            </Typography>
            <UserActivityChart data={userActivity} />
          </Paper>
        </Grid>

        {/* Audit Logs */}
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
