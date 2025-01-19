import React from 'react';
import { Tab, Tabs } from '@mui/material';
import {
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as AlertsIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';

interface AdminTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ value, onChange }) => {
  return (
    <Tabs
      value={value}
      onChange={onChange}
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
  );
};
