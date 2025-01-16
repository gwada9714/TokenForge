import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatEther } from 'ethers';
import useTokenForgeStats from '@/hooks/useTokenForgeStats';
import { useTokenForgePremium } from '@/hooks/useTokenForgePremium';
import type { TokenForgeStats, TokenForgeService } from '@/types/tokenforge';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface TaxDistributionData {
  name: string;
  value: number;
}

interface TaxHistoryData {
  date: string;
  amount: number;
}

export const RevenueDashboard: React.FC = () => {
  const theme = useTheme();
  const forgeStats = useTokenForgeStats();
  const { services, isLoading: servicesLoading } = useTokenForgePremium();

  if (forgeStats.isLoading || servicesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Données pour le graphique en camembert des taxes
  const taxDistributionData: TaxDistributionData[] = [
    { name: 'TokenForge', value: Number(formatEther(forgeStats.totalTaxToForge)) },
    { name: 'Dev Fund', value: Number(formatEther(forgeStats.totalTaxToDevFund)) },
    { name: 'Buyback', value: Number(formatEther(forgeStats.totalTaxToBuyback)) },
    { name: 'Staking', value: Number(formatEther(forgeStats.totalTaxToStaking)) }
  ];

  // Données pour le graphique en barres de l'historique des taxes
  const taxHistoryData: TaxHistoryData[] = forgeStats.taxHistory.map((entry) => ({
    date: new Date(entry.timestamp * 1000).toLocaleDateString(),
    amount: Number(formatEther(entry.amount))
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord des Revenus
      </Typography>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Taxes Totales Collectées
              </Typography>
              <Typography variant="h5">
                {formatEther(forgeStats.totalTaxCollected)} ETH
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Valeur Totale Verrouillée
              </Typography>
              <Typography variant="h5">
                {formatEther(forgeStats.totalValueLocked)} ETH
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Transactions Totales
              </Typography>
              <Typography variant="h5">
                {forgeStats.totalTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Services Premium Actifs
              </Typography>
              <Typography variant="h5">
                {services.filter(s => s.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution des Taxes
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taxDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(2)} ETH`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taxDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Historique des Taxes
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8884d8" name="Montant (ETH)" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tableau des services premium */}
      <Paper sx={{ mt: 4, width: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Services Premium
        </Typography>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Prix de Base</TableCell>
                <TableCell>Frais de Configuration</TableCell>
                <TableCell>Frais Mensuels</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{formatEther(service.pricing.basePrice)} ETH</TableCell>
                  <TableCell>{formatEther(service.pricing.setupFee)} ETH</TableCell>
                  <TableCell>{formatEther(service.pricing.monthlyFee)} ETH</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: service.isActive ? 'success.main' : 'error.main'
                      }}
                    >
                      {service.isActive ? 'Actif' : 'Inactif'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
