import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

export interface SystemStatusProps {
  status: {
    server: "online" | "degraded" | "offline";
    database: "online" | "degraded" | "offline";
    blockchain: {
      ethereum: "online" | "degraded" | "offline";
      binance: "online" | "degraded" | "offline";
      polygon: "online" | "degraded" | "offline";
      avalanche: "online" | "degraded" | "offline";
      solana: "online" | "degraded" | "offline";
    };
    cache: "online" | "degraded" | "offline";
    queue: "online" | "degraded" | "offline";
  };
}

/**
 * Composant affichant l'état du système
 * Montre l'état des différents services (serveur, base de données, blockchains, etc.)
 */
export const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  // Fonction pour obtenir l'icône en fonction du statut
  const getStatusIcon = (status: "online" | "degraded" | "offline") => {
    switch (status) {
      case "online":
        return <CheckCircleIcon sx={{ color: "success.main" }} />;
      case "degraded":
        return <WarningIcon sx={{ color: "warning.main" }} />;
      case "offline":
        return <ErrorIcon sx={{ color: "error.main" }} />;
    }
  };

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status: "online" | "degraded" | "offline") => {
    switch (status) {
      case "online":
        return "success";
      case "degraded":
        return "warning";
      case "offline":
        return "error";
    }
  };

  // Fonction pour obtenir le texte en fonction du statut
  const getStatusText = (status: "online" | "degraded" | "offline") => {
    switch (status) {
      case "online":
        return "En ligne";
      case "degraded":
        return "Dégradé";
      case "offline":
        return "Hors ligne";
    }
  };

  // Calculer le pourcentage global de santé du système
  const calculateSystemHealth = () => {
    const statusValues = {
      online: 100,
      degraded: 50,
      offline: 0,
    };

    const values = [
      statusValues[status.server],
      statusValues[status.database],
      statusValues[status.blockchain.ethereum],
      statusValues[status.blockchain.binance],
      statusValues[status.blockchain.polygon],
      statusValues[status.blockchain.avalanche],
      statusValues[status.blockchain.solana],
      statusValues[status.cache],
      statusValues[status.queue],
    ];

    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const systemHealth = calculateSystemHealth();

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Santé du système: {systemHealth}%
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={systemHealth}
                color={
                  systemHealth > 80
                    ? "success"
                    : systemHealth > 50
                    ? "warning"
                    : "error"
                }
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" gutterBottom>
              Services principaux
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              {getStatusIcon(status.server)}
              <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                Serveur API
              </Typography>
              <Chip
                label={getStatusText(status.server)}
                size="small"
                color={getStatusColor(status.server)}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              {getStatusIcon(status.database)}
              <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                Base de données
              </Typography>
              <Chip
                label={getStatusText(status.database)}
                size="small"
                color={getStatusColor(status.database)}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              {getStatusIcon(status.cache)}
              <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                Cache
              </Typography>
              <Chip
                label={getStatusText(status.cache)}
                size="small"
                color={getStatusColor(status.cache)}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {getStatusIcon(status.queue)}
              <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                File de traitement
              </Typography>
              <Chip
                label={getStatusText(status.queue)}
                size="small"
                color={getStatusColor(status.queue)}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={8}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" gutterBottom>
              Connexions blockchain
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {getStatusIcon(status.blockchain.ethereum)}
                  <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                    Ethereum
                  </Typography>
                  <Chip
                    label={getStatusText(status.blockchain.ethereum)}
                    size="small"
                    color={getStatusColor(status.blockchain.ethereum)}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {getStatusIcon(status.blockchain.binance)}
                  <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                    Binance
                  </Typography>
                  <Chip
                    label={getStatusText(status.blockchain.binance)}
                    size="small"
                    color={getStatusColor(status.blockchain.binance)}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {getStatusIcon(status.blockchain.polygon)}
                  <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                    Polygon
                  </Typography>
                  <Chip
                    label={getStatusText(status.blockchain.polygon)}
                    size="small"
                    color={getStatusColor(status.blockchain.polygon)}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {getStatusIcon(status.blockchain.avalanche)}
                  <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                    Avalanche
                  </Typography>
                  <Chip
                    label={getStatusText(status.blockchain.avalanche)}
                    size="small"
                    color={getStatusColor(status.blockchain.avalanche)}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {getStatusIcon(status.blockchain.solana)}
                  <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                    Solana
                  </Typography>
                  <Chip
                    label={getStatusText(status.blockchain.solana)}
                    size="small"
                    color={getStatusColor(status.blockchain.solana)}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Valeurs par défaut pour le développement et les tests
SystemStatus.defaultProps = {
  status: {
    server: "online",
    database: "online",
    blockchain: {
      ethereum: "online",
      binance: "online",
      polygon: "online",
      avalanche: "degraded",
      solana: "online",
    },
    cache: "online",
    queue: "online",
  },
};
