import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Tooltip,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { AlertRule } from "../../../../types/contracts";

interface AlertListProps {
  rules: AlertRule[];
  onDelete: (ruleId: string) => Promise<void>;
  isLoading: boolean;
}

export const AlertList: React.FC<AlertListProps> = ({
  rules,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <List>
        {[1, 2, 3].map((i) => (
          <ListItem key={i}>
            <ListItemText
              primary={<Skeleton width="60%" />}
              secondary={<Skeleton width="80%" />}
            />
            <ListItemSecondaryAction>
              <Skeleton width={100} height={40} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  }

  if (rules.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Aucune règle d'alerte configurée
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {rules.map((rule) => (
        <ListItem
          key={rule.id}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 1,
            mb: 1,
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <ListItemText
            primary={
              <Typography variant="subtitle1" component="div">
                {rule.name}
              </Typography>
            }
            secondary={
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {rule.condition}
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <Tooltip title="Supprimer">
              <IconButton
                edge="end"
                onClick={() => onDelete(rule.id)}
                disabled={isLoading}
                color="error"
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default AlertList;
