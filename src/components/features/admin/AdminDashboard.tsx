import React, { useState, useCallback } from 'react';
import { Box, Container, Alert, Snackbar } from '@mui/material';
import { TabPanel } from '../../common/TabPanel';
import { ContractControls } from './contract/ContractControls';
import { OwnershipManagement } from './ownership/OwnershipManagement';
import { AlertsManagement } from './alerts/AlertsManagement';
import { AuditLogs } from './audit/AuditLogs';
import { AuditStats } from './audit/AuditStats';
import { AdminHeader } from './AdminHeader';
import { AdminTabs } from './AdminTabs';

/**
 * Dashboard principal de l'interface d'administration.
 * Fournit une vue d'ensemble et la navigation vers les différentes sections admin.
 *
 * @component
 * @example
 * ```tsx
 * <AdminDashboard />
 * ```
 */
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
        <AdminHeader />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <AdminTabs value={tabValue} onChange={handleTabChange} />
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AuditStats onError={handleError} />
            <AuditLogs onError={handleError} />
          </Box>
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

export default React.memo(AdminDashboard);
