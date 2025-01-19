import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { TabPanel } from '../common/TabPanel';
import { ContractControls } from './ContractControls';
import { OwnershipManagement } from './OwnershipManagement';
import { AlertsManagement } from './AlertsManagement';
import { AuditLogs } from './AuditLogs';
import { AuditStats } from './AuditStats';
import { AdminHeader } from './AdminHeader';
import { AdminTabs } from './AdminTabs';

export const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 3 }}>
        <AdminHeader />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <AdminTabs value={tabValue} onChange={handleTabChange} />
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
