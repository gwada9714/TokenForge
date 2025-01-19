import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

type AlertSeverity = 'info' | 'warning' | 'error';
type AlertTarget = 'all' | 'users' | 'admins';

interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  target: AlertTarget;
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export const AlertsManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState<Partial<Alert>>({
    message: '',
    severity: 'info',
    target: 'all',
    active: true,
  });

  const handleAddAlert = () => {
    setEditingAlert(null);
    setFormData({
      message: '',
      severity: 'info',
      target: 'all',
      active: true,
    });
    setOpenDialog(true);
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData(alert);
    setOpenDialog(true);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleSaveAlert = () => {
    if (editingAlert) {
      setAlerts(alerts.map(alert =>
        alert.id === editingAlert.id
          ? { ...alert, ...formData }
          : alert
      ));
    } else {
      const newAlert: Alert = {
        id: Math.random().toString(36).substr(2, 9),
        message: formData.message || '',
        severity: formData.severity || 'info',
        target: formData.target || 'all',
        active: formData.active || true,
        createdAt: new Date(),
        expiresAt: formData.expiresAt,
      };
      setAlerts([...alerts, newAlert]);
    }
    setOpenDialog(false);
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Alert Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddAlert}
        >
          Add Alert
        </Button>
      </Box>

      <Paper>
        <List>
          {alerts.map((alert) => (
            <ListItem
              key={alert.id}
              sx={{
                borderLeft: 6,
                borderLeftColor: `${getSeverityColor(alert.severity)}.main`,
                mb: 1,
              }}
            >
              <ListItemText
                primary={alert.message}
                secondary={
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Chip
                        label={alert.target}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item>
                      <Chip
                        label={alert.active ? 'Active' : 'Inactive'}
                        size="small"
                        color={alert.active ? 'success' : 'default'}
                      />
                    </Grid>
                    {alert.expiresAt && (
                      <Grid item>
                        <Typography variant="caption">
                          Expires: {alert.expiresAt.toLocaleDateString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditAlert(alert)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAlert ? 'Edit Alert' : 'Create New Alert'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  value={formData.message || ''}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={formData.severity || 'info'}
                    label="Severity"
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}
                  >
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Target</InputLabel>
                  <Select
                    value={formData.target || 'all'}
                    label="Target"
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as AlertTarget })}
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="users">Regular Users</MenuItem>
                    <MenuItem value="admins">Administrators</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expiration Date"
                  type="datetime-local"
                  value={formData.expiresAt?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    expiresAt: e.target.value ? new Date(e.target.value) : undefined
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveAlert}
            variant="contained"
            color="primary"
            disabled={!formData.message}
          >
            {editingAlert ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(AlertsManagement);
