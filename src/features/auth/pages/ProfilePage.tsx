import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Avatar,
  Button,
  Divider,
  Tab,
  Tabs,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { state } = useTokenForgeAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'JohnDoe',
    email: 'john@example.com',
    bio: 'Développeur Blockchain',
    notifications: {
      email: true,
      push: true,
      transactions: true
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = () => {
    // TODO: Implémenter la sauvegarde
    setEditMode(false);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: event.target.checked
      }
    }));
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mon Profil
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Section Profil */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3}>
            <Box p={3} display="flex" flexDirection="column" alignItems="center">
              <Avatar
                sx={{ width: 100, height: 100, mb: 2 }}
                src="/path-to-avatar.jpg"
              />
              <Typography variant="h6" gutterBottom>
                {profileData.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.email}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleEditToggle}
                sx={{ mt: 2 }}
              >
                {editMode ? 'Annuler' : 'Modifier le profil'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Section Détails */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<AccountIcon />} label="Profil" />
              <Tab icon={<SecurityIcon />} label="Sécurité" />
              <Tab icon={<NotificationsIcon />} label="Notifications" />
              <Tab icon={<WalletIcon />} label="Wallets" />
            </Tabs>

            {/* Onglet Profil */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    value={profileData.username}
                    onChange={handleInputChange('username')}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    onChange={handleInputChange('email')}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={profileData.bio}
                    onChange={handleInputChange('bio')}
                    disabled={!editMode}
                    multiline
                    rows={4}
                  />
                </Grid>
                {editMode && (
                  <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleSave}>
                      Enregistrer
                    </Button>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            {/* Onglet Sécurité */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Authentification à deux facteurs
                  </Typography>
                  <Button variant="outlined" color="primary">
                    Configurer 2FA
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Changer le mot de passe
                  </Typography>
                  <Button variant="outlined" color="primary">
                    Modifier le mot de passe
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Onglet Notifications */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.notifications.email}
                        onChange={handleNotificationChange('email')}
                      />
                    }
                    label="Notifications par email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.notifications.push}
                        onChange={handleNotificationChange('push')}
                      />
                    }
                    label="Notifications push"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.notifications.transactions}
                        onChange={handleNotificationChange('transactions')}
                      />
                    }
                    label="Alertes de transactions"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Onglet Wallets */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Wallets Connectés
                  </Typography>
                  <Button variant="contained" color="primary">
                    Connecter un nouveau wallet
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  {/* Liste des wallets à implémenter */}
                  <Typography color="text.secondary">
                    Aucun wallet connecté
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 