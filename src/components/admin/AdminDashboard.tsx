import React, { useState } from 'react';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { Card, Container, Typography, Box, Button, TextField, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { parseEther, formatEther, type Address } from 'viem';
import type { PlanStats, PlanStatsMap } from '../../hooks/useTokenForgeAdmin';

// Types pour les plans
export enum PlanType {
  FREE = 0,
  BASIC = 1,
  PRO = 2,
  ENTERPRISE = 3
}

const AdminDashboard: React.FC = () => {
  const {
    isAdmin,
    tokenCount,
    planStats,
    handleUpdatePlanPrice,
    handleTogglePause,
    handleTransferOwnership,
  } = useTokenForgeAdmin();

  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          Vous n'avez pas les droits d'administration nécessaires.
        </Alert>
      </Container>
    );
  }

  const handlePriceUpdate = () => {
    if (selectedPlanId === null) return;
    try {
      const priceInWei = parseEther(newPlanPrice);
      handleUpdatePlanPrice(selectedPlanId, priceInWei);
    } catch (error) {
      console.error('Erreur de format du prix:', error);
    }
  };

  const handleOwnershipTransfer = () => {
    if (newOwnerAddress) {
      handleTransferOwnership(newOwnerAddress as Address);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nom', width: 130 },
    { field: 'price', headerName: 'Prix (ETH)', width: 130 },
    { field: 'subscribers', headerName: 'Abonnés', width: 130 },
    { field: 'revenue', headerName: 'Revenus (ETH)', width: 130 },
  ];

  const rows = Object.entries(PlanType)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => {
      const planId = Number(value);
      const stats = planStats[planId] as PlanStats | undefined;
      
      return {
        id: planId,
        name: key,
        price: stats ? formatEther(stats.price) : '0',
        subscribers: stats ? stats.subscribers : 0,
        revenue: stats ? formatEther(stats.revenue) : '0',
      };
    });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrateur
      </Typography>

      {/* Statistiques générales */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mb: 4 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Nombre total de tokens</Typography>
          <Typography variant="h4">{tokenCount}</Typography>
        </Card>
      </Box>

      {/* Tableau des plans */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Statistiques des plans
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
        />
      </Card>

      {/* Actions administratives */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Actions administratives
        </Typography>

        <Box sx={{ display: 'grid', gap: 2, maxWidth: 400 }}>
          {/* Mise à jour du prix d'un plan */}
          <Box>
            <TextField
              select
              label="Plan"
              fullWidth
              value={selectedPlanId ?? ''}
              onChange={(e) => setSelectedPlanId(Number(e.target.value))}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Sélectionner un plan</option>
              {Object.entries(PlanType)
                .filter(([key]) => isNaN(Number(key)))
                .map(([key, value]) => (
                  <option key={value} value={value}>
                    {key}
                  </option>
                ))}
            </TextField>
            <TextField
              label="Nouveau prix (ETH)"
              type="number"
              value={newPlanPrice}
              onChange={(e) => setNewPlanPrice(e.target.value)}
              fullWidth
              sx={{ mt: 1 }}
            />
            <Button
              variant="contained"
              onClick={handlePriceUpdate}
              disabled={!selectedPlanId || !newPlanPrice}
              sx={{ mt: 1 }}
            >
              Mettre à jour le prix
            </Button>
          </Box>

          {/* Transfert de propriété */}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Nouvelle adresse propriétaire"
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleOwnershipTransfer}
              disabled={!newOwnerAddress}
              sx={{ mt: 1 }}
            >
              Transférer la propriété
            </Button>
          </Box>

          {/* Bouton pause/reprise */}
          <Button
            variant="contained"
            color="warning"
            onClick={handleTogglePause}
            sx={{ mt: 2 }}
          >
            Pause/Reprise du contrat
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
