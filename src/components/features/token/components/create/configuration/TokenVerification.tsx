import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { TokenConfig } from '../../../../../../types/token';
import { formatEther } from 'viem';

interface TokenVerificationProps {
  config: TokenConfig;
  price: number;
  payWithTKN: boolean;
}

const TokenVerification: React.FC<TokenVerificationProps> = ({
  config,
  price,
  payWithTKN,
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Vérification des détails du token
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Veuillez vérifier attentivement les détails de votre token avant de procéder au déploiement.
      </Alert>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Informations générales
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Nom du token
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {config.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Symbole
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {config.symbol}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Supply initiale
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {config.supply} {config.symbol}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Décimales
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {config.decimals}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Fonctionnalités
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {Object.entries(config.features).filter(([_, enabled]) => enabled).length > 0 ? (
            Object.entries(config.features)
              .filter(([_, enabled]) => enabled)
              .map(([feature, _]) => (
                <Chip 
                  key={feature} 
                  label={feature} 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                />
              ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucune fonctionnalité spéciale sélectionnée
            </Typography>
          )}
        </Box>
        
        {config.taxConfig && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Configuration des taxes
            </Typography>
            <List dense>
              {config.taxConfig.buyTax > 0 && (
                <ListItem>
                  <ListItemText 
                    primary="Taxe d'achat" 
                    secondary={`${config.taxConfig.buyTax}%`} 
                  />
                </ListItem>
              )}
              {config.taxConfig.sellTax > 0 && (
                <ListItem>
                  <ListItemText 
                    primary="Taxe de vente" 
                    secondary={`${config.taxConfig.sellTax}%`} 
                  />
                </ListItem>
              )}
              {config.taxConfig.transferTax > 0 && (
                <ListItem>
                  <ListItemText 
                    primary="Taxe de transfert" 
                    secondary={`${config.taxConfig.transferTax}%`} 
                  />
                </ListItem>
              )}
              {config.taxConfig.recipient && (
                <ListItem>
                  <ListItemText 
                    primary="Adresse de réception" 
                    secondary={config.taxConfig.recipient} 
                  />
                </ListItem>
              )}
              {config.taxConfig.distribution && (
                <ListItem>
                  <ListItemText 
                    primary="Distribution" 
                    secondary={`Treasury: ${config.taxConfig.distribution.treasury}%, Development: ${config.taxConfig.distribution.development}%, Buyback: ${config.taxConfig.distribution.buyback}%, Staking: ${config.taxConfig.distribution.staking}%`} 
                  />
                </ListItem>
              )}
            </List>
          </>
        )}
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Plan et paiement
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Plan sélectionné
            </Typography>
            <Typography variant="body1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
              {config.plan}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Méthode de paiement
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {payWithTKN ? 'Token TKN' : 'ETH'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Prix total
            </Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {payWithTKN 
                ? `${formatEther(BigInt(Math.floor(price * 1e18)))} TKN` 
                : formatPrice(price)
              }
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TokenVerification;
