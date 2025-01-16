import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Chip,
  Stack
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { parseEther, formatEther } from 'ethers';
import { useTokenForgePremium } from '@/hooks/useTokenForgePremium';
import type { TokenForgeService } from '@/types/tokenforge';

interface ServiceFormData {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  setupFee: string;
  monthlyFee: string;
  features: string[];
  isActive: boolean;
}

const initialFormData: ServiceFormData = {
  id: '',
  name: '',
  description: '',
  basePrice: '0',
  setupFee: '0',
  monthlyFee: '0',
  features: [],
  isActive: true
};

export const ServiceManagement: React.FC = () => {
  const { services, isLoading } = useTokenForgePremium();
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [newFeature, setNewFeature] = useState('');

  const handleOpen = (service?: TokenForgeService) => {
    if (service) {
      setFormData({
        id: service.id,
        name: service.name,
        description: service.description,
        basePrice: formatEther(service.pricing.basePrice),
        setupFee: formatEther(service.pricing.setupFee),
        monthlyFee: formatEther(service.pricing.monthlyFee),
        features: [...service.features],
        isActive: service.isActive
      });
      setEditingService(formData);
    } else {
      setFormData(initialFormData);
      setEditingService(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setEditingService(null);
    setNewFeature('');
  };

  const handleSubmit = async () => {
    try {
      const serviceData: TokenForgeService = {
        id: formData.id || `service-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        pricing: {
          basePrice: parseEther(formData.basePrice),
          setupFee: parseEther(formData.setupFee),
          monthlyFee: parseEther(formData.monthlyFee)
        },
        features: formData.features,
        isActive: formData.isActive
      };

      // TODO: Implémenter la logique de mise à jour du contrat
      console.log('Service à sauvegarder:', serviceData);
      
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du service:', error);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Gestion des Services</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nouveau Service
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      Base: {formatEther(service.pricing.basePrice)} ETH
                    </Typography>
                    <Typography variant="body2">
                      Setup: {formatEther(service.pricing.setupFee)} ETH
                    </Typography>
                    <Typography variant="body2">
                      Mensuel: {formatEther(service.pricing.monthlyFee)} ETH
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={service.isActive ? 'Actif' : 'Inactif'}
                    color={service.isActive ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(service)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService ? 'Modifier le Service' : 'Nouveau Service'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nom du service"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                label="Prix de base (ETH)"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
              />
              <TextField
                label="Frais de setup (ETH)"
                type="number"
                value={formData.setupFee}
                onChange={(e) => setFormData(prev => ({ ...prev, setupFee: e.target.value }))}
              />
              <TextField
                label="Frais mensuels (ETH)"
                type="number"
                value={formData.monthlyFee}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyFee: e.target.value }))}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Fonctionnalités
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Nouvelle fonctionnalité"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  fullWidth
                />
                <Button variant="outlined" onClick={handleAddFeature}>
                  Ajouter
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.features.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    onDelete={() => handleRemoveFeature(index)}
                  />
                ))}
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Typography>Service actif</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingService ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
