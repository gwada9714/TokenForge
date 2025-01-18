import React, { useState } from 'react';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import {
  Container,
  Alert,
  Box,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import { TabPanel, a11yProps } from '../common/TabPanel';
import { AlertsManagement } from './AlertsManagement';
import { AuditLogs } from './AuditLogs';
import { ContractControls } from './ContractControls';
import { OwnershipManagement } from './OwnershipManagement';

interface PlanData {
  id: number;
  name: string;
  price: bigint;
}

const AdminDashboard: React.FC = () => {
  const {
    isAdmin,
    error,
  } = useTokenForgeAdmin();

  const [tabValue, setTabValue] = useState(0);

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          Vous n'avez pas les droits d'administration nécessaires.
        </Alert>
      </Container>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Contrôle du Contrat" {...a11yProps(0)} />
          <Tab label="Gestion de la Propriété" {...a11yProps(1)} />
          <Tab label="Alertes" {...a11yProps(2)} />
          <Tab label="Logs d'Audit" {...a11yProps(3)} />
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
        <AuditLogs />
      </TabPanel>

      {error && (
        <Snackbar open={!!error} autoHideDuration={6000}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default AdminDashboard;
