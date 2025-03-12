import React, { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography, Paper, Alert, Button } from '@mui/material';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Composant simple pour tester si le problème est lié au routage ou aux composants importés
const SimpleTestComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  return (
    <Box>
      <Typography variant="h5">Composant de test simple</Typography>
      <Typography>Ce composant fonctionne correctement si vous pouvez voir ce texte.</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setCount(count + 1)}
        sx={{ mt: 2 }}
      >
        Cliqué {count} fois
      </Button>
    </Box>
  );
};

/**
 * Page de test pour les services Firebase
 * Regroupe les différents composants de test pour Firestore
 */
const FirebaseTestPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ mb: 4, p: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Firebase Test Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Cette page permet de tester les différentes fonctionnalités Firebase utilisées dans l'application.
          Utilisez les onglets ci-dessous pour accéder aux différents tests.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Version simplifiée pour diagnostiquer les problèmes d'affichage.
        </Alert>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="firebase test tabs">
          <Tab label="Test Simple" id="tab-0" aria-controls="tabpanel-0" />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <SimpleTestComponent />
      </TabPanel>
    </Container>
  );
};

export default FirebaseTestPage;
