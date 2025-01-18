import React, { useState } from 'react';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { Card, Container, Typography, Box, Button, TextField, Alert, Grid, Divider } from '@mui/material';
import { DataGrid, GridColDef, GridValueFormatter } from '@mui/x-data-grid';
import { parseEther, formatEther, type Address } from 'viem';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import LoadingButton from '@mui/lab/LoadingButton';

interface PlanData {
  id: number;
  name: string;
  price: bigint;
}

const AdminDashboard: React.FC = () => {
  const {
    isAdmin,
    tokenCount,
    planStats,
    handleUpdatePlanPrice,
    handleTogglePause,
    handleTransferOwnership,
    isPaused,
    isPausing,
    isUnpausing,
    contractAddress,
  } = useTokenForgeAdmin();

  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          Vous n'avez pas les droits d'administration nécessaires.
        </Alert>
      </Container>
    );
  }

  const rows: PlanData[] = Object.values(planStats || {}).map(plan => ({
    id: plan.id,
    name: plan.name,
    price: BigInt(plan.price.toString()),
  }));

  const priceFormatter: GridValueFormatter = (params) => {
    const value = params.value as bigint;
    return `${formatEther(value)} ETH`;
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nom', width: 130 },
    { 
      field: 'price', 
      headerName: 'Prix', 
      width: 130,
      valueFormatter: priceFormatter
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <TextField
            size="small"
            placeholder="Nouveau prix (ETH)"
            sx={{ width: 120, mr: 1 }}
            onChange={(e) => setNewPlanPrice(e.target.value)}
          />
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => {
              if (newPlanPrice) {
                handleUpdatePlanPrice(Number(params.row.id), parseEther(newPlanPrice));
              }
            }}
          >
            Modifier
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrateur
      </Typography>

      <Grid container spacing={3}>
        {/* État du Contrat */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              État du Contrat
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography color="text.secondary">Adresse du contrat</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {contractAddress}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography color="text.secondary">État</Typography>
              <Typography color={isPaused ? 'error' : 'success.main'}>
                {isPaused ? 'En pause' : 'Actif'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography color="text.secondary">Nombre total de tokens</Typography>
              <Typography>{tokenCount?.toString() || '0'}</Typography>
            </Box>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Box sx={{ mb: 3 }}>
              <LoadingButton
                component="button"
                variant="contained"
                color={isPaused ? "success" : "warning"}
                onClick={handleTogglePause}
                loading={isPausing || isUnpausing}
                startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                fullWidth
              >
                {isPaused ? 'Réactiver le contrat' : 'Mettre en pause le contrat'}
              </LoadingButton>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Transférer la propriété
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Nouvelle adresse du propriétaire"
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                variant="outlined"
                onClick={() => handleTransferOwnership(newOwnerAddress)}
                fullWidth
              >
                Transférer la propriété
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Plans */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gestion des Plans
            </Typography>
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
            />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
