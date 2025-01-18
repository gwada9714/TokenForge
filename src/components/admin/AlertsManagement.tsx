import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  enabled: boolean;
}

export const AlertsManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const { contract } = useTokenForgeAdmin();

  const handleAddRule = useCallback(() => {
    if (newRuleName && newRuleCondition) {
      const newRule: AlertRule = {
        id: Date.now().toString(),
        name: newRuleName,
        condition: newRuleCondition,
        enabled: true,
      };
      setAlertRules(prev => [...prev, newRule]);
      setNewRuleName('');
      setNewRuleCondition('');
    }
  }, [newRuleName, newRuleCondition]);

  const handleToggleRule = useCallback((id: string) => {
    setAlertRules(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  }, []);

  const handleDeleteRule = useCallback((id: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Gestion des Alertes
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Nom de l'alerte"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Condition"
            value={newRuleCondition}
            onChange={(e) => setNewRuleCondition(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRule}
            disabled={!newRuleName || !newRuleCondition}
          >
            Ajouter une alerte
          </Button>
        </Box>

        <List>
          {alertRules.map((rule) => (
            <ListItem key={rule.id}>
              <ListItemText
                primary={rule.name}
                secondary={rule.condition}
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={rule.enabled}
                  onChange={() => handleToggleRule(rule.id)}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
