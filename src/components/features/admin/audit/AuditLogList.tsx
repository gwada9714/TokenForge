import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Skeleton,
  Chip,
  Paper,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import DeleteIcon from '@mui/icons-material/Delete';
import type { AuditLog } from '../../../../types/contracts';

interface AuditLogListProps {
  logs: AuditLog[];
  onViewDetails: (log: AuditLog) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const getLevelIcon = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return <ErrorIcon color="error" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'info':
      return <InfoIcon color="info" />;
    case 'debug':
      return <BugReportIcon color="disabled" />;
    default:
      return <InfoIcon />;
  }
};

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'debug':
      return 'default';
    default:
      return 'default';
  }
};

export const AuditLogList: React.FC<AuditLogListProps> = ({
  logs,
  onViewDetails,
  onDelete,
  isLoading = false,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <List aria-label="audit logs loading">
          {[...Array(5)].map((_, index) => (
            <ListItem
              key={index}
              divider={index < 4}
              secondaryAction={
                <Skeleton 
                  variant="rectangular" 
                  width={96} 
                  height={32} 
                  data-testid="skeleton"
                  aria-hidden="true"
                />
              }
            >
              <ListItemText
                primary={<Skeleton width="60%" data-testid="skeleton" aria-hidden="true" />}
                secondary={<Skeleton width="40%" data-testid="skeleton" aria-hidden="true" />}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  }

  if (logs.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body1" color="textSecondary">
          Aucun log d'audit disponible
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <List aria-label="audit logs">
        {logs.map((log, index) => (
          <ListItem
            key={log.id}
            divider={index < logs.length - 1}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label={`delete log ${log.action}`}
                onClick={() => onDelete(log.id)}
                disabled={isLoading}
                data-testid={`delete-button-${log.id}`}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {getLevelIcon(log.level)}
                  <Typography variant="body1" component="span">
                    {log.message}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CategoryIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {log.category}
                    </Typography>
                  </Box>
                  <Chip
                    label={log.level}
                    size="small"
                    color={getLevelColor(log.level) as any}
                    variant="outlined"
                  />
                </Box>
              }
              aria-label={`log entry ${log.message}`}
            />
            <ListItemSecondaryAction>
              <Tooltip title="Voir les détails">
                <IconButton
                  edge="end"
                  onClick={() => onViewDetails(log)}
                  size="small"
                  sx={{ color: theme.palette.primary.main }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default React.memo(AuditLogList);
