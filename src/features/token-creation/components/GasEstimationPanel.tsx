import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Alert,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGasEstimation } from '@/hooks/useGasEstimation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GasEstimate } from '@/core/services/GasEstimationService';

type PriorityLevel = 'low' | 'medium' | 'high';

const CongestionColors = {
  Low: 'success',
  Medium: 'warning',
  High: 'error'
} as const;

export const GasEstimationPanel: React.FC = () => {
  const { gasEstimate, deploymentEstimate, isLoading, error, refetch } = useGasEstimation();

  const renderTooltip = (text: string) => (
    <Tooltip title={text} arrow placement="top">
      <IconButton size="small" sx={{ ml: 1 }}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const getPriorityData = (priority: PriorityLevel, estimate: GasEstimate) => {
    return {
      price: estimate[priority].price,
      time: estimate[priority].time
    };
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Erreur lors de la récupération des estimations de gas : {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <LocalGasStationIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Estimations de Gas
            </Typography>
            {renderTooltip('Estimations des coûts de déploiement basées sur les conditions actuelles du réseau')}
          </Box>
          
          {!isLoading && (
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Mis à jour {gasEstimate && 
                  formatDistanceToNow(gasEstimate.updatedAt, { 
                    addSuffix: true,
                    locale: fr 
                  })
                }
              </Typography>
              <IconButton onClick={refetch} size="small">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {!isLoading && gasEstimate && (
          <Box mb={3}>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                Congestion du Réseau:
              </Typography>
              <Chip
                label={gasEstimate.networkCongestion}
                color={CongestionColors[gasEstimate.networkCongestion]}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Gas de Base: {(Number(gasEstimate.estimatedBaseFee) / 1e9).toFixed(2)} Gwei
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {(['low', 'medium', 'high'] as const).map((priority) => (
            <Grid item xs={12} md={4} key={priority}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Priorité {priority === 'low' ? 'Basse' : priority === 'medium' ? 'Moyenne' : 'Haute'}
                  </Typography>

                  {isLoading ? (
                    <Box>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  ) : gasEstimate && deploymentEstimate ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {deploymentEstimate.totalCost[priority]} {deploymentEstimate.nativeCurrency}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gas Price: {(Number(getPriorityData(priority, gasEstimate).price) / 1e9).toFixed(2)} Gwei
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Temps Estimé: {getPriorityData(priority, gasEstimate).time}
                      </Typography>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {!isLoading && deploymentEstimate && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Gas Limit Estimé: {Number(deploymentEstimate.gasLimit).toLocaleString()} unités
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
