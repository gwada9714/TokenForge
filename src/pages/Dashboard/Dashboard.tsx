import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useUserTokens } from '../../hooks/useUserTokens';

export const Dashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { tokens, loading, error } = useUserTokens(address);

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Connectez votre wallet pour accéder à votre tableau de bord
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error" gutterBottom>
          Une erreur est survenue lors du chargement de vos tokens
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Grid container spacing={3}>
        {/* Résumé */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Tableau de Bord
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total des Tokens Créés
                    </Typography>
                    <Typography variant="h4">
                      {tokens?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Tokens Actifs
                    </Typography>
                    <Typography variant="h4">
                      {tokens?.filter(token => !token.burned)?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Tokens avec Taxes
                    </Typography>
                    <Typography variant="h4">
                      {tokens?.filter(token => token.taxConfig?.enabled)?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Liste des Tokens */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Vos Tokens
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/create')}
              >
                Créer un nouveau token
              </Button>
            </Box>
            <List>
              {tokens && tokens.length > 0 ? (
                tokens.map((token, index) => (
                  <React.Fragment key={token.address}>
                    {index > 0 && <Divider />}
                    <ListItem
                      button
                      onClick={() => navigate(`/tokens/${token.address}`)}
                      sx={{ py: 2 }}
                    >
                      <ListItemText
                        primary={token.name}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {token.symbol}
                            </Typography>
                            {` - Supply: ${token.totalSupply}`}
                          </React.Fragment>
                        }
                      />
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tokens/${token.address}`);
                        }}
                      >
                        Détails
                      </Button>
                    </ListItem>
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="Aucun token créé"
                    secondary="Commencez par créer votre premier token !"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
