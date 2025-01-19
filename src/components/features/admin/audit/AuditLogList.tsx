import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { AuditLog } from '../../../../types/contracts';

interface AuditLogListProps {
  logs: AuditLog[];
  onDeleteLog?: (logId: number) => void;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
  logs,
  onDeleteLog,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <List>
      {logs.map((log) => (
        <ListItem key={log.id}>
          <ListItemText
            primary={log.action}
            secondary={`${formatDate(log.timestamp)} - ${log.address}`}
          />
          {onDeleteLog && (
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDeleteLog(log.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default AuditLogList;
