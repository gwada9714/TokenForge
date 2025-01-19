import React, { useState } from 'react';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Paper,
  Typography,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as AlertsIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import { TabPanel } from '../common/TabPanel';
import { ContractControls } from './ContractControls';
import { OwnershipManagement } from './OwnershipManagement';
import { AlertsManagement } from '../Alerts/AlertsManagement';
import { AuditLogs } from '../Audit/AuditLogs';
import { AuditStats } from '../Audit/AuditStats';

export const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Paper sx={{ mb: 2, p: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Tableau de bord administrateur
          </Typography>
          <Typography color="textSecondary" paragraph>
            Gérez les paramètres du contrat, les alertes et consultez les logs d'audit.
          </Typography>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Admin dashboard tabs"
          >
            <Tab
              icon={<SecurityIcon />}
              label="Contrôle du contrat"
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab
              icon={<SettingsIcon />}
              label="Gestion de la propriété"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab
              icon={<AlertsIcon />}
              label="Alertes"
              id="tab-2"
              aria-controls="tabpanel-2"
            />
            <Tab
              icon={<StatsIcon />}
              label="Logs & Statistiques"
              id="tab-3"
              aria-controls="tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ContractControls />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <OwnershipManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AlertsManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AuditStats />
            <AuditLogs />
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};
