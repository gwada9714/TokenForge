import React from 'react';
import { Container, Typography, Grid, Paper, Box, Divider, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { TimelineOutlined, NotificationsOutlined, AccountBalanceWalletOutlined, TokenOutlined } from '@mui/icons-material';
import { StatCard } from '../components/StatCard';
import { ActivityList } from '../components/ActivityList';
import { NotificationPanel } from '../components/NotificationPanel';
import { QuickActions } from '../components/QuickActions';
import { useDashboardData } from '../hooks/useDashboardData';

export const DashboardPage: React.FC = () => {
  const { stats, activities, notifications } = useDashboardData();

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de bord
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tokens"
            value={stats.totalTokens}
            icon={<TokenOutlined />}
            trend={stats.tokensTrend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Valeur Totale"
            value={`${stats.totalValue} BNB`}
            icon={<AccountBalanceWalletOutlined />}
            trend={stats.valueTrend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Staking Actif"
            value={`${stats.activeStaking} Tokens`}
            icon={<TimelineOutlined />}
            trend={stats.stakingTrend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Notifications"
            value={notifications.length}
            icon={<NotificationsOutlined />}
            trend={0}
          />
        </Grid>
      </Grid>

      {/* Activités et Notifications */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Activités Récentes
              </Typography>
              <Divider sx={{ my: 2 }} />
              <ActivityList activities={activities} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Divider sx={{ my: 2 }} />
              <NotificationPanel notifications={notifications} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Actions Rapides */}
      <Box mt={4}>
        <Paper elevation={1}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Actions Rapides
            </Typography>
            <Divider sx={{ my: 2 }} />
            <QuickActions />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}; 