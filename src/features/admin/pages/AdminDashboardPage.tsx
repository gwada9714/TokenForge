import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { AdminStats } from '../components/AdminStats';
import { UserActivityChart } from '../components/UserActivityChart';
import { TokenDistributionChart } from '../components/TokenDistributionChart';
import { RecentTransactions } from '../components/RecentTransactions';
import { SystemStatus } from '../components/SystemStatus';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

export const AdminDashboardPage: React.FC = () => {
  const { stats, userActivity, tokenDistribution, transactions, systemStatus } = useAdminDashboard();

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administration
        </Typography>
      </Box>

      {/* Statistiques Globales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <AdminStats stats={stats} />
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Activité Utilisateurs
              </Typography>
              <UserActivityChart data={userActivity} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Distribution des Tokens
              </Typography>
              <TokenDistributionChart data={tokenDistribution} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Transactions et État du Système */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Transactions Récentes
              </Typography>
              <RecentTransactions transactions={transactions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                État du Système
              </Typography>
              <SystemStatus status={systemStatus} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 