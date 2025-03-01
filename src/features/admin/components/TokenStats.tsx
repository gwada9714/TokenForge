import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  LinearProgress,
  useTheme
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  Bolt as BoltIcon,
  LocalFireDepartment as FireIcon,
  Paid as PaidIcon
} from '@mui/icons-material';

/**
 * Composant affichant les statistiques des tokens
 * Montre les métriques clés comme le nombre de tokens créés, les transactions, etc.
 */
export const TokenStats: React.FC = () => {
  const theme = useTheme();

  // Données de démonstration
  const stats = {
    tokensCreated: {
      total: 1245,
      change: 12.5,
      period: 'cette semaine'
    },
    activeTokens: {
      total: 876,
      change: 5.2,
      period: 'cette semaine'
    },
    totalTransactions: {
      total: 45678,
      change: -2.3,
      period: 'cette semaine'
    },
    averageFees: {
      total: '0.025 ETH',
      change: 8.7,
      period: 'cette semaine'
    },
    totalVolume: {
      total: '1.2M USD',
      change: 15.3,
      period: 'cette semaine'
    }
  };

  // Fonction pour afficher la tendance
  const renderTrend = (change: number) => {
    const color = change >= 0 ? theme.palette.success.main : theme.palette.error.main;
    const Icon = change >= 0 ? TrendingUpIcon : TrendingDownIcon;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', color }}>
        <Icon fontSize="small" sx={{ mr: 0.5 }} />
        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', color }}>
          {change >= 0 ? '+' : ''}{change}%
        </Typography>
        <Typography variant="body2" component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
          cette semaine
        </Typography>
      </Box>
    );
  };

  // Composant pour une carte de statistique
  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon,
    color
  }: { 
    title: string; 
    value: string | number; 
    change: number; 
    icon: React.ElementType;
    color: string;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              backgroundColor: `${color}20`, 
              borderRadius: '50%', 
              p: 1, 
              mr: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ color }} />
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        
        {renderTrend(change)}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <StatCard 
          title="Tokens Créés" 
          value={stats.tokensCreated.total} 
          change={stats.tokensCreated.change} 
          icon={BoltIcon}
          color={theme.palette.primary.main}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <StatCard 
          title="Tokens Actifs" 
          value={stats.activeTokens.total} 
          change={stats.activeTokens.change} 
          icon={FireIcon}
          color={theme.palette.secondary.main}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <StatCard 
          title="Transactions" 
          value={stats.totalTransactions.total} 
          change={stats.totalTransactions.change} 
          icon={PaidIcon}
          color={theme.palette.success.main}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Répartition par Blockchain
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Ethereum</Typography>
                    <Typography variant="body2" fontWeight="bold">45%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={45} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      backgroundColor: `${theme.palette.primary.main}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.primary.main
                      }
                    }} 
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Binance Smart Chain</Typography>
                    <Typography variant="body2" fontWeight="bold">30%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={30} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      backgroundColor: `${theme.palette.warning.main}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.warning.main
                      }
                    }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Polygon</Typography>
                    <Typography variant="body2" fontWeight="bold">15%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={15} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      backgroundColor: `${theme.palette.secondary.main}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.secondary.main
                      }
                    }} 
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Avalanche</Typography>
                    <Typography variant="body2" fontWeight="bold">5%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={5} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      backgroundColor: `${theme.palette.error.main}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.error.main
                      }
                    }} 
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Solana</Typography>
                    <Typography variant="body2" fontWeight="bold">3%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={3} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      backgroundColor: `${theme.palette.success.main}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.success.main
                      }
                    }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Autres</Typography>
                    <Typography variant="body2" fontWeight="bold">2%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={2} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      backgroundColor: `${theme.palette.grey[500]}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.grey[500]
                      }
                    }} 
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
