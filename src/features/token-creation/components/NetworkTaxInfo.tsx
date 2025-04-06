import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNetworkTaxConfig } from "@/hooks/useNetworkTaxConfig";
import { useNetwork } from "../hooks/useNetwork";
import { ethers } from "ethers";

export const NetworkTaxInfo: React.FC = () => {
  const { taxConfig, isLoading, error, formatCost, isSupported } =
    useNetworkTaxConfig();
  const { chain } = useNetwork();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !isSupported) {
    return (
      <Alert severity="error">
        {error || "Réseau non supporté. Veuillez changer de réseau."}
      </Alert>
    );
  }

  const renderTooltip = (text: string) => (
    <Tooltip title={text} arrow placement="top">
      <IconButton size="small" sx={{ ml: 1 }}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Configuration du Réseau {chain?.name}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1">Taxe de Base</Typography>
                  {renderTooltip("Taxe fixe appliquée à chaque transaction")}
                </Box>
                <Typography variant="h4" color="primary">
                  {taxConfig.baseTaxRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1">
                    Taxe Additionnelle Max
                  </Typography>
                  {renderTooltip("Taxe maximale que vous pouvez configurer")}
                </Box>
                <Typography variant="h4" color="primary">
                  {taxConfig.maxAdditionalTaxRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1">
                    Montant Minimum de Tokens
                  </Typography>
                  {renderTooltip("Montant minimum requis pour le déploiement")}
                </Box>
                <Typography variant="h4">
                  {ethers.formatEther(taxConfig.minTokenAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1">
                    Coût de Déploiement Estimé
                  </Typography>
                  {renderTooltip("Coût estimé pour le déploiement du contrat")}
                </Box>
                <Typography variant="h4">
                  {formatCost(
                    taxConfig.deploymentCost.estimated,
                    taxConfig.deploymentCost.currency
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          Les coûts de déploiement peuvent varier en fonction de la congestion
          du réseau. Assurez-vous d'avoir suffisamment de{" "}
          {taxConfig.deploymentCost.currency} dans votre portefeuille.
        </Alert>
      </CardContent>
    </Card>
  );
};
