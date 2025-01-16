import React from 'react';
import { Container, Tab, Tabs, Box } from '@mui/material';
import { RevenueDashboard } from '@/components/admin/RevenueDashboard';
import { ServiceManagement } from '@/components/admin/ServiceManagement';
import { TaxConfiguration } from '@/components/admin/TaxConfiguration';
import { RequirePlan } from '@/components/auth/RequirePlan';
import { PlanType } from '@/types/premium';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <RequirePlan requiredPlan={PlanType.MaitreForgeron}>
      <Container maxWidth="xl">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="admin dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Revenus & Statistiques" {...a11yProps(0)} />
            <Tab label="Gestion des Services" {...a11yProps(1)} />
            <Tab label="Configuration des Taxes" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <RevenueDashboard />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <ServiceManagement />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <TaxConfiguration />
        </TabPanel>
      </Container>
    </RequirePlan>
  );
};

export default AdminDashboard;
