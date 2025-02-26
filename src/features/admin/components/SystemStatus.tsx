import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  LinearProgress,
  Typography
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface SystemStatusData {
  services: {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    performance: number;
  }[];
}

interface SystemStatusProps {
  status: SystemStatusData;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon color="success" />;
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'down':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'success';
    if (performance >= 70) return 'warning';
    return 'error';
  };

  return (
    <List>
      {status.services.map((service) => (
        <ListItem key={service.name} divider>
          <ListItemIcon>
            {getStatusIcon(service.status)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">
                  {service.name}
                </Typography>
                <Chip
                  label={service.status}
                  size="small"
                  color={getStatusColor(service.status)}
                />
              </Box>
            }
            secondary={
              <Box mt={1}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Performance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {service.performance}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={service.performance}
                  color={getPerformanceColor(service.performance)}
                />
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}; 