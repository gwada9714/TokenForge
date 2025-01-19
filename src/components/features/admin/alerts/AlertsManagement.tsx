import React, { useState } from 'react';
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
import { useTokenForgeAdmin } from '../../../hooks/useTokenForgeAdmin';
import { AlertRule } from '../../../types/contracts';

export const AlertsManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const { contract } = useTokenForgeAdmin();
  const [isLoading, setIsLoading] = useState(false);

  // Lecture des règles
  const { data: rules, refetch: refetchRules } = useTokenForgeAdmin().getAlertRules({
    enabled: true,
  });

  // Mise à jour des règles quand les données changent
  React.useEffect(() => {
    if (rules) {
      setAlertRules([...rules] as AlertRule[]);
    }
  }, [rules]);

  // Ajout d'une règle
  const handleAddRule = async () => {
    if (!contract || !newRuleName || !newRuleCondition) return;

    try {
      setIsLoading(true);
      await contract.addAlertRule(newRuleName, newRuleCondition);
      
      await refetchRules();
      setNewRuleName('');
      setNewRuleCondition('');
    } catch (error) {
      console.error('Error adding rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Basculement d'une règle
  const handleToggleRule = async (ruleId: bigint) => {
    if (!contract) return;

    try {
      setIsLoading(true);
      await contract.toggleAlertRule(ruleId);
      
      await refetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Suppression d'une règle
  const handleDeleteRule = async (ruleId: bigint) => {
    if (!contract) return;

    try {
      setIsLoading(true);
      await contract.deleteAlertRule(ruleId);
      
      await refetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestion des Alertes
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Nom de la règle"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isLoading}
          />
          <TextField
            label="Condition"
            value={newRuleCondition}
            onChange={(e) => setNewRuleCondition(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={20} /> : <AddIcon />}
            onClick={handleAddRule}
            disabled={!newRuleName || !newRuleCondition || isLoading}
            sx={{ mt: 1 }}
          >
            Ajouter une règle
          </Button>
        </Box>

        <List>
          {alertRules.map((rule) => (
            <ListItem key={rule.id.toString()}>
              <ListItemText
                primary={rule.name}
                secondary={rule.condition}
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={() => handleToggleRule(rule.id)}
                  checked={rule.enabled}
                  disabled={isLoading}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteRule(rule.id)}
                  disabled={isLoading}
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
