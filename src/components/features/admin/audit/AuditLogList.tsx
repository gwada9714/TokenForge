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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import type { AuditLog } from '../../../../types/contracts';

interface AuditLogListProps {
  logs: AuditLog[];
  onDeleteLog?: (logId: number) => void;
  isLoading?: boolean;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
  logs,
  onDeleteLog,
  isLoading = false,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (isLoading) {
    return (
      <List>
        {[1, 2, 3].map((i) => (
          <ListItem
            key={i}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemText
              primary={<Skeleton width="40%" />}
              secondary={
                <>
                  <Skeleton width="60%" />
                  <Skeleton width="80%" />
                </>
              }
            />
            <ListItemSecondaryAction>
              <Skeleton width={40} height={40} variant="circular" />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  }

  if (logs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Aucun log d'audit disponible
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {logs.map((log) => (
        <ListItem
          key={log.id}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            mb: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={log.action}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {log.data && (
                  <Typography variant="body2" color="text.secondary">
                    {log.data}
                  </Typography>
                )}
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatDate(log.timestamp)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {log.address}
                  </Typography>
                </Box>
              </Box>
            }
          />
          {onDeleteLog && (
            <ListItemSecondaryAction>
              <Tooltip title="Supprimer ce log">
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDeleteLog(log.id)}
                  disabled={isLoading}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default AuditLogList;
