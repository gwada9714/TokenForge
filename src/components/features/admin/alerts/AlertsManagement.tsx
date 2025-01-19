import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTokenForgeAdmin } from '../../../../hooks/useTokenForgeAdmin';
import type { AlertRule } from '../../../../types/contracts';

export const AlertsManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const { contract } = useTokenForgeAdmin();

  // Chargement initial des règles
  useEffect(() => {
    loadAlertRules();
  }, [contract]);

  // Chargement des règles d'alerte
  const loadAlertRules = async () => {
    if (!contract) return;
    try {
      const rules = await contract.getAlertRules();
      setAlertRules(rules);
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
    }
  };

  // Ajout d'une nouvelle règle
  const handleAddRule = async () => {
    if (!contract || !newRuleName || !newRuleCondition) return;
    try {
      await contract.addAlertRule(newRuleName, newRuleCondition);
      setNewRuleName('');
      setNewRuleCondition('');
      await loadAlertRules();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la règle:', error);
    }
  };

  // Suppression d'une règle
  const handleDeleteRule = async (ruleId: number) => {
    if (!contract) return;
    try {
      await contract.deleteAlertRule(ruleId);
      await loadAlertRules();
    } catch (error) {
      console.error('Erreur lors de la suppression de la règle:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Gestion des Alertes
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          label="Nom de la règle"
          value={newRuleName}
          onChange={(e) => setNewRuleName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Condition"
          value={newRuleCondition}
          onChange={(e) => setNewRuleCondition(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRule}
          disabled={!newRuleName || !newRuleCondition}
          sx={{ mt: 2 }}
        >
          Ajouter une règle
        </Button>
      </Box>

      <List>
        {alertRules.map((rule, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={rule.name}
              secondary={rule.condition}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteRule(index)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
