import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider,
  Chip
} from '@mui/material';
import { 
  TokenOutlined, 
  SwapHorizOutlined, 
  AccountBalanceWalletOutlined,
  LockOutlined
} from '@mui/icons-material';

// Types for activity items
export interface ActivityItem {
  id: string;
  type: 'token_created' | 'token_transfer' | 'staking' | 'liquidity';
  title: string;
  description: string;
  timestamp: string;
  amount?: string;
  status?: 'completed' | 'pending' | 'failed';
}

// Helper function to get icon based on activity type
const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'token_created':
      return <TokenOutlined />;
    case 'token_transfer':
      return <SwapHorizOutlined />;
    case 'staking':
      return <LockOutlined />;
    case 'liquidity':
      return <AccountBalanceWalletOutlined />;
    default:
      return <TokenOutlined />;
  }
};

// Helper function to get status color
const getStatusColor = (status?: ActivityItem['status']) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

interface ActivityListItemProps {
  activity: ActivityItem;
}

export const ActivityListItem: React.FC<ActivityListItemProps> = ({ activity }) => {
  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemIcon>
          {getActivityIcon(activity.type)}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" component="span">
                {activity.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activity.timestamp}
              </Typography>
            </Box>
          }
          secondary={
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" component="span">
                {activity.description}
              </Typography>
              <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                {activity.amount && (
                  <Chip 
                    size="small" 
                    label={activity.amount} 
                    variant="outlined" 
                  />
                )}
                {activity.status && (
                  <Chip 
                    size="small" 
                    label={activity.status} 
                    color={getStatusColor(activity.status) as "success" | "warning" | "error" | "default" | undefined}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

interface DashboardActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
}

export const DashboardActivity: React.FC<DashboardActivityProps> = ({
  activities = [],
  isLoading = false,
  maxItems = 5
}) => {
  // Sample activities for demonstration
  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'token_created',
      title: 'Token TKN créé',
      description: 'Vous avez créé un nouveau token ERC-20 avec succès',
      timestamp: 'Il y a 2 heures',
      status: 'completed'
    },
    {
      id: '2',
      type: 'staking',
      title: 'Staking activé',
      description: 'Vous avez mis en stake 1000 TKN',
      timestamp: 'Il y a 1 jour',
      amount: '1000 TKN',
      status: 'completed'
    },
    {
      id: '3',
      type: 'token_transfer',
      title: 'Transfert de tokens',
      description: 'Vous avez envoyé des tokens à 0x1234...5678',
      timestamp: 'Il y a 3 jours',
      amount: '500 TKN',
      status: 'completed'
    },
    {
      id: '4',
      type: 'liquidity',
      title: 'Liquidité ajoutée',
      description: 'Vous avez ajouté de la liquidité au pool TKN/ETH',
      timestamp: 'Il y a 1 semaine',
      amount: '200 TKN + 0.5 ETH',
      status: 'completed'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : sampleActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activité Récente
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Chargement des activités...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Activité Récente
      </Typography>
      {limitedActivities.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {limitedActivities.map((activity) => (
            <ActivityListItem key={activity.id} activity={activity} />
          ))}
        </List>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aucune activité récente à afficher
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
