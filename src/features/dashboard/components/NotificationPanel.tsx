import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, IconButton, Typography, Box } from '@mui/material';
import { 
  NotificationsOutlined,
  ErrorOutline,
  CheckCircleOutline,
  InfoOutlined,
  Close as CloseIcon
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications }) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutline color="success" />;
      case 'error':
        return <ErrorOutline color="error" />;
      case 'warning':
        return <NotificationsOutlined color="warning" />;
      case 'info':
        return <InfoOutlined color="info" />;
      default:
        return <NotificationsOutlined />;
    }
  };

  const handleDismiss = (id: string) => {
    // TODO: Implémenter la logique de suppression
    console.log('Dismissing notification:', id);
  };

  return (
    <List>
      {notifications.length === 0 ? (
        <ListItem>
          <ListItemText
            primary={
              <Typography variant="body2" color="text.secondary" align="center">
                Aucune notification
              </Typography>
            }
          />
        </ListItem>
      ) : (
        notifications.map((notification) => (
          <ListItem
            key={notification.id}
            divider
            sx={{
              opacity: notification.read ? 0.7 : 1,
              bgcolor: notification.read ? 'transparent' : 'action.hover'
            }}
          >
            <ListItemIcon>
              {getNotificationIcon(notification.type)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                  >
                    {notification.message}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {notification.timestamp}
                </Typography>
              }
            />
          </ListItem>
        ))
      )}
    </List>
  );
}; 