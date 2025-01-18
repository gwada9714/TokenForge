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
import { monitor } from '../../utils/monitoring';

/**
 * Interface représentant une règle d'alerte
 * @interface AlertRule
 * @property {string} id - Identifiant unique de la règle
 * @property {string} name - Nom de la règle
 * @property {string} condition - Condition déclenchant l'alerte
 * @property {boolean} enabled - État d'activation de la règle
 */
interface AlertRule {
  id: string;
  name: string;
  condition: string;
  enabled: boolean;
}

/**
 * Composant de gestion des alertes
 * 
 * Permet de créer, activer/désactiver et supprimer des règles d'alerte.
 * Utilise le hook useTokenForgeAdmin pour interagir avec le smart contract.
 * 
 * @component
 * @example
 * ```tsx
 * <AlertsManagement />
 * ```
 */
export const AlertsManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const { contract, isProcessing } = useTokenForgeAdmin();

  const handleAddRule = useCallback(async () => {
    if (newRuleName && newRuleCondition) {
      try {
        const newRule: AlertRule = {
          id: Date.now().toString(),
          name: newRuleName,
          condition: newRuleCondition,
          enabled: true,
        };
        
        if (contract) {
          monitor.info('AlertsManagement', 'Adding new alert rule', { name: newRule.name });
          await contract.addAlertRule(newRule.name, newRule.condition);
          setAlertRules(prev => [...prev, newRule]);
          setNewRuleName('');
          setNewRuleCondition('');
          monitor.info('AlertsManagement', 'Alert rule added successfully', { id: newRule.id });
        }
      } catch (error) {
        monitor.error('AlertsManagement', 'Error adding alert rule', { error, rule: { name: newRuleName, condition: newRuleCondition } });
        console.error('Erreur lors de l\'ajout de la règle:', error);
      }
    }
  }, [newRuleName, newRuleCondition, contract]);

  const handleToggleRule = useCallback(async (id: string) => {
    try {
      if (contract) {
        monitor.info('AlertsManagement', 'Toggling alert rule', { id });
        await contract.toggleAlertRule(id);
        setAlertRules(prev =>
          prev.map(rule =>
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
          )
        );
        monitor.info('AlertsManagement', 'Alert rule toggled successfully', { id });
      }
    } catch (error) {
      monitor.error('AlertsManagement', 'Error toggling alert rule', { error, id });
      console.error('Erreur lors de la modification de la règle:', error);
    }
  }, [contract]);

  const handleDeleteRule = useCallback(async (id: string) => {
    try {
      if (contract) {
        monitor.info('AlertsManagement', 'Deleting alert rule', { id });
        await contract.deleteAlertRule(id);
        setAlertRules(prev => prev.filter(rule => rule.id !== id));
        monitor.info('AlertsManagement', 'Alert rule deleted successfully', { id });
      }
    } catch (error) {
      monitor.error('AlertsManagement', 'Error deleting alert rule', { error, id });
      console.error('Erreur lors de la suppression de la règle:', error);
    }
  }, [contract]);

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
            disabled={!newRuleName || !newRuleCondition || isProcessing}
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
                  disabled={isProcessing}
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
