import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTokenForgeAdmin } from '../../../../hooks/useTokenForgeAdmin';
import type { AlertRule } from '../../../../types/contracts';
import { AlertForm } from './AlertForm';
import { AlertList } from './AlertList';

/**
 * Composant de gestion des alertes.
 * Permet de créer, modifier et supprimer des règles d'alerte.
 *
 * @component
 * @example
 * ```tsx
 * <AlertsManagement />
 * ```
 *
 * @remarks
 * Ce composant utilise le hook useTokenForgeAdmin pour interagir avec le contrat.
 * Les alertes sont stockées sur la blockchain et peuvent être configurées pour
 * surveiller différentes conditions.
 */
export const AlertsManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const { contract } = useTokenForgeAdmin();

  // Chargement initial des règles
  useEffect(() => {
    loadAlertRules();
  }, [contract]);

  const loadAlertRules = async () => {
    if (!contract) return;
    try {
      const rules = await contract.getAlertRules();
      setAlertRules(rules);
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
    }
  };

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

  const handleToggleRule = async (ruleId: number) => {
    if (!contract) return;
    try {
      await contract.toggleAlertRule(ruleId);
      await loadAlertRules();
    } catch (error) {
      console.error('Erreur lors de la modification de la règle:', error);
    }
  };

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
      <Typography variant="h6" gutterBottom>
        Gestion des Alertes
      </Typography>

      <AlertForm
        newRuleName={newRuleName}
        newRuleCondition={newRuleCondition}
        onNameChange={setNewRuleName}
        onConditionChange={setNewRuleCondition}
        onSubmit={handleAddRule}
      />

      <AlertList
        rules={alertRules}
        onToggleRule={handleToggleRule}
        onDeleteRule={handleDeleteRule}
      />
    </Box>
  );
};

export default AlertsManagement;
