import React from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useSystemSettings } from "../hooks/useSystemSettings";

export const SystemSettingsPage: React.FC = () => {
  const {
    settings,
    loading,
    error,
    saveSettings,
    updateMaintenanceMode,
    updateSecuritySettings,
    updateFees,
    updateNetworks,
    reloadSettings,
  } = useSystemSettings();

  const handleMaintenanceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateMaintenanceMode(event.target.checked);
  };

  const handleNetworkChange = (network: keyof typeof settings.networks) => {
    updateNetworks({
      [network]: !settings.networks[network],
    });
  };

  const handleSecurityChange =
    (field: keyof typeof settings.security) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : Number(event.target.value);
      updateSecuritySettings({
        [field]: value,
      });
    };

  const handleFeeChange =
    (field: keyof typeof settings.fees) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateFees({
        [field]: Number(event.target.value),
      });
    };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Paramètres Système
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Mode Maintenance */}
        <Grid item xs={12}>
          <Paper elevation={1}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Mode Maintenance
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenance.enabled}
                    onChange={handleMaintenanceChange}
                  />
                }
                label="Activer le mode maintenance"
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Message de maintenance"
                value={settings.maintenance.message}
                onChange={(e) =>
                  updateMaintenanceMode(
                    settings.maintenance.enabled,
                    e.target.value
                  )
                }
                sx={{ mt: 2 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Sécurité */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Sécurité</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tentatives de connexion max"
                    value={settings.security.maxLoginAttempts}
                    onChange={handleSecurityChange("maxLoginAttempts")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Timeout de session (minutes)"
                    value={settings.security.sessionTimeout}
                    onChange={handleSecurityChange("sessionTimeout")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.requireEmailVerification}
                        onChange={handleSecurityChange(
                          "requireEmailVerification"
                        )}
                      />
                    }
                    label="Exiger la vérification email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.require2FA}
                        onChange={handleSecurityChange("require2FA")}
                      />
                    }
                    label="Exiger l'authentification à deux facteurs"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Frais */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Frais</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Frais de création de token (BNB)"
                    value={settings.fees.tokenCreation}
                    onChange={handleFeeChange("tokenCreation")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Frais de staking (%)"
                    value={settings.fees.stakingFee}
                    onChange={handleFeeChange("stakingFee")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Frais de marketing (BNB)"
                    value={settings.fees.marketingFee}
                    onChange={handleFeeChange("marketingFee")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Frais KYC (USD)"
                    value={settings.fees.kycFee}
                    onChange={handleFeeChange("kycFee")}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Réseaux */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Réseaux Supportés</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {Object.entries(settings.networks).map(([network, enabled]) => (
                  <Grid item xs={12} sm={6} md={4} key={network}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabled}
                          onChange={() =>
                            handleNetworkChange(
                              network as keyof typeof settings.networks
                            )
                          }
                        />
                      }
                      label={network.charAt(0).toUpperCase() + network.slice(1)}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box mt={4} display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={() => saveSettings(settings)}
        >
          Sauvegarder
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={reloadSettings}
        >
          Réinitialiser
        </Button>
      </Box>
    </Container>
  );
};
