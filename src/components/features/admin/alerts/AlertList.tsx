import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { AlertRule } from '../../../../types/contracts';

interface AlertListProps {
  rules: AlertRule[];
  onToggleRule: (ruleId: number) => void;
  onDeleteRule: (ruleId: number) => void;
}

export const AlertList: React.FC<AlertListProps> = ({
  rules,
  onToggleRule,
  onDeleteRule,
}) => {
  return (
    <List>
      {rules.map((rule) => (
        <ListItem key={rule.id}>
          <ListItemText
            primary={rule.name}
            secondary={rule.condition}
          />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              checked={rule.enabled}
              onChange={() => onToggleRule(rule.id)}
            />
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDeleteRule(rule.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default AlertList;
