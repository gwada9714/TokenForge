import React from 'react';
import { Box, Container, Tab, Tabs } from '@mui/material';
import { ContractDebugger } from '../../components/ContractDebugger/ContractDebugger';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="admin tabs">
            <Tab label="Vue d'ensemble" />
            <Tab label="Débogage Contrat" />
            <Tab label="Configuration" />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          <Box sx={{ p: 2 }}>
            <h2>Vue d'ensemble de l'administration</h2>
            {/* Ajoutez ici le contenu de la vue d'ensemble */}
          </Box>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <ContractDebugger />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Box sx={{ p: 2 }}>
            <h2>Configuration</h2>
            {/* Ajoutez ici le contenu de la configuration */}
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
}
