import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { contract } = useTokenForgeAdmin();

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const loadAlertRules = useCallback(async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const rules = await contract.getAlertRules();
      setAlertRules(rules);
    } catch (err) {
      showError('Erreur lors du chargement des règles');
      console.error('Erreur lors du chargement des règles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    loadAlertRules();
  }, [loadAlertRules]);

  const validateRule = (name: string, condition: string): boolean => {
    if (!name.trim()) {
      showError('Le nom de la règle est requis');
      return false;
    }
    if (!condition.trim()) {
      showError('La condition est requise');
      return false;
    }
    if (name.length > 50) {
      showError('Le nom de la règle est trop long (max 50 caractères)');
      return false;
    }
    if (alertRules.some(rule => rule.name === name)) {
      showError('Une règle avec ce nom existe déjà');
      return false;
    }
    return true;
  };

  const handleAddRule = async () => {
    if (!contract) {
      showError('Contract non initialisé');
      return;
    }

    if (!validateRule(newRuleName, newRuleCondition)) return;

    setIsLoading(true);
    try {
      await contract.addAlertRule(newRuleName, newRuleCondition);
      setNewRuleName('');
      setNewRuleCondition('');
      await loadAlertRules();
      showSuccess('Règle ajoutée avec succès');
    } catch (err) {
      showError('Erreur lors de l\'ajout de la règle');
      console.error('Erreur lors de l\'ajout de la règle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: number) => {
    if (!contract) {
      showError('Contract non initialisé');
      return;
    }

    setIsLoading(true);
    try {
      await contract.toggleAlertRule(ruleId);
      await loadAlertRules();
      showSuccess('État de la règle modifié avec succès');
    } catch (err) {
      showError('Erreur lors de la modification de la règle');
      console.error('Erreur lors de la modification de la règle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!contract) {
      showError('Contract non initialisé');
      return;
    }

    setIsLoading(true);
    try {
      await contract.deleteAlertRule(ruleId);
      await loadAlertRules();
      showSuccess('Règle supprimée avec succès');
    } catch (err) {
      showError('Erreur lors de la suppression de la règle');
      console.error('Erreur lors de la suppression de la règle:', err);
    } finally {
      setIsLoading(false);
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
        isLoading={isLoading}
      />

      <AlertList
        rules={alertRules}
        onToggleRule={handleToggleRule}
        onDeleteRule={handleDeleteRule}
        isLoading={isLoading}
      />

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AlertsManagement;
