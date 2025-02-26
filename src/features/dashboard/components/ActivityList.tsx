import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Typography, Chip, Box } from '@mui/material';
import { 
  TokenOutlined,
  SwapHorizOutlined,
  AccountBalanceWalletOutlined,
  LockOutlined
} from '@mui/icons-material';

interface Activity {
  id: string;
  type: 'token_creation' | 'transaction' | 'staking' | 'withdrawal';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface ActivityListProps {
  activities: Activity[];
}

export const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'token_creation':
        return <TokenOutlined />;
      case 'transaction':
        return <SwapHorizOutlined />;
      case 'staking':
        return <LockOutlined />;
      case 'withdrawal':
        return <AccountBalanceWalletOutlined />;
      default:
        return <TokenOutlined />;
    }
  };

  const getStatusColor = (status: Activity['status']) => {
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

  return (
    <List>
      {activities.map((activity) => (
        <ListItem key={activity.id} divider>
          <ListItemIcon>
            {getActivityIcon(activity.type)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">
                  {activity.title}
                </Typography>
                <Chip
                  size="small"
                  label={activity.status}
                  color={getStatusColor(activity.status)}
                />
              </Box>
            }
            secondary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {activity.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.timestamp}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}; 