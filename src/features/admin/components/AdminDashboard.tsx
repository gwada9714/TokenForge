import React, { useState, useCallback } from 'react';
import { Box, Container, Alert, Snackbar, Tab, Tabs } from '@mui/material';
import { TabPanel } from '../../../components/common/TabPanel';
import ContractControls from './ContractControls';
import OwnershipManagement from './OwnershipManagement';
import AlertsManagement from './AlertsManagement';
import AuditLogs from './AuditLogs';

export const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Contract Controls" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
            <Tab label="Ownership" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
            <Tab label="Alerts" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
            <Tab label="Audit Logs" id="admin-tab-3" aria-controls="admin-tabpanel-3" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ContractControls onError={handleError} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <OwnershipManagement onError={handleError} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AlertsManagement onError={handleError} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <AuditLogs onError={handleError} />
        </TabPanel>
      </Box>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};
