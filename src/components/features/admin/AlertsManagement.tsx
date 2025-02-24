import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  AlertColor,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useContract } from '../../../hooks/useContract';

interface AlertItem {
  id: string;
  type: AlertType;
  message: string;
  active: boolean;
  timestamp: number;
}

type AlertType = 'info' | 'warning' | 'error';

interface FormData {
  type: AlertType;
  message: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const AlertsManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type: 'info',
    message: '',
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { contract } = useContract('token');

  const handleAddAlert = useCallback(async () => {
    try {
      const tx = await contract?.addAlert(formData.type, formData.message);
      await tx?.wait();
      
      setAlerts(prev => [...prev, {
        id: Date.now().toString(),
        ...formData,
        active: true,
        timestamp: Date.now(),
      }]);
      
      setOpenDialog(false);
      setFormData({ type: 'info', message: '' });
      setSnackbar({
        open: true,
        message: 'Alert added successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add alert',
        severity: 'error',
      });
    }
  }, [contract, formData]);

  const handleEditAlert = useCallback(async (alert: AlertItem) => {
    try {
      const tx = await contract?.updateAlert(alert.id, formData.type, formData.message);
      await tx?.wait();
      
      setAlerts(prev =>
        prev.map(a => (a.id === alert.id ? { ...a, ...formData } : a))
      );
      
      setOpenDialog(false);
      setEditingAlert(null);
      setFormData({ type: 'info', message: '' });
      setSnackbar({
        open: true,
        message: 'Alert updated successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update alert',
        severity: 'error',
      });
    }
  }, [contract, formData]);

  const handleDeleteAlert = useCallback(async (id: string) => {
    try {
      const tx = await contract?.deleteAlert(id);
      await tx?.wait();
      
      setAlerts(prev => prev.filter(a => a.id !== id));
      setSnackbar({
        open: true,
        message: 'Alert deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete alert',
        severity: 'error',
      });
    }
  }, [contract]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Alerts Management</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setOpenDialog(true)}
        >
          Add Alert
        </Button>
      </Box>

      <Card>
        <CardContent>
          <List>
            {alerts.map((alert) => (
              <ListItem
                key={alert.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => {
                        setEditingAlert(alert);
                        setFormData({
                          type: alert.type,
                          message: alert.message,
                        });
                        setOpenDialog(true);
                      }}
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
                  </Box>
                }
              >
                <ListItemText
                  primary={alert.message}
                  secondary={`${alert.type} - ${new Date(
                    alert.timestamp
                  ).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setEditingAlert(null);
        setFormData({ type: 'info', message: '' });
      }}>
        <DialogTitle>
          {editingAlert ? 'Edit Alert' : 'Add New Alert'}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AlertType }))}
            margin="normal"
          >
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="error">Error</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingAlert(null);
            setFormData({ type: 'info', message: '' });
          }}>
            Cancel
          </Button>
          <Button
            onClick={() => editingAlert ? handleEditAlert(editingAlert) : handleAddAlert()}
            variant="contained"
            disabled={!formData.message.trim()}
          >
            {editingAlert ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AlertsManagement;
