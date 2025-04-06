import React from "react";
import { Tab, Tabs, Box } from "@mui/material";
import {
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as AlertsIcon,
  Assessment as StatsIcon,
} from "@mui/icons-material";

interface AdminTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const a11yProps = (index: number) => ({
  id: `admin-tab-${index}`,
  "aria-controls": `admin-tabpanel-${index}`,
  "aria-label": [
    "Contrôle du contrat",
    "Gestion de la propriété",
    "Gestion des alertes",
    "Logs et statistiques d'audit",
  ][index],
});

export const AdminTabs: React.FC<AdminTabsProps> = ({ value, onChange }) => {
  return (
    <Box
      role="navigation"
      aria-label="Sections du tableau de bord administrateur"
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Onglets du tableau de bord administrateur"
        sx={{
          "& .MuiTab-root": {
            minHeight: 72,
            py: 1,
          },
          "& .MuiTab-iconWrapper": {
            mb: 1,
          },
        }}
      >
        <Tab
          icon={<SecurityIcon />}
          label="Contrôle du contrat"
          {...a11yProps(0)}
        />
        <Tab
          icon={<SettingsIcon />}
          label="Gestion de la propriété"
          {...a11yProps(1)}
        />
        <Tab icon={<AlertsIcon />} label="Alertes" {...a11yProps(2)} />
        <Tab
          icon={<StatsIcon />}
          label="Logs & Statistiques"
          {...a11yProps(3)}
        />
      </Tabs>
    </Box>
  );
};
