import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertRule {
  id: string;
  type: AlertType;
  pattern: string;
  enabled: boolean;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

interface AlertState {
  rules: AlertRule[];
  history: Array<{
    timestamp: number;
    type: AlertType;
    message: string;
    ruleId?: string;
  }>;
}

export const useAlertManagement = () => {
  const [state, setState] = useState<AlertState>({
    rules: [],
    history: [],
  });

  // Ajouter une nouvelle règle d'alerte
  const addRule = useCallback((rule: Omit<AlertRule, 'id'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setState(prev => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }));

    return newRule.id;
  }, []);

  // Supprimer une règle
  const removeRule = useCallback((ruleId: string) => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId),
    }));
  }, []);

  // Activer/désactiver une règle
  const toggleRule = useCallback((ruleId: string) => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ),
    }));
  }, []);

  // Vérifier si un message correspond à une règle
  const checkRules = useCallback((message: string): AlertRule | undefined => {
    return state.rules.find(
      rule => rule.enabled && new RegExp(rule.pattern).test(message)
    );
  }, [state.rules]);

  // Afficher une alerte
  const showAlert = useCallback(
    (
      type: AlertType,
      message: string,
      options?: { duration?: number; ruleId?: string }
    ) => {
      const { duration = 5000, ruleId } = options || {};

      // Ajouter à l'historique
      setState(prev => ({
        ...prev,
        history: [
          {
            timestamp: Date.now(),
            type,
            message,
            ruleId,
          },
          ...prev.history,
        ].slice(0, 100), // Garder les 100 dernières alertes
      }));

      // Afficher la notification
      switch (type) {
        case 'success':
          toast.success(message, { duration });
          break;
        case 'error':
          toast.error(message, { duration });
          break;
        case 'warning':
          toast(message, {
            duration,
            icon: '⚠️',
            style: {
              background: '#fff7cd',
              color: '#7a4f01',
            },
          });
          break;
        case 'info':
        default:
          toast(message, {
            duration,
            icon: 'ℹ️',
            style: {
              background: '#e5f6fd',
              color: '#014361',
            },
          });
          break;
      }
    },
    []
  );

  // Vérifier un message et afficher une alerte si une règle correspond
  const processMessage = useCallback(
    (message: string) => {
      const matchingRule = checkRules(message);
      if (matchingRule) {
        showAlert(matchingRule.type, matchingRule.message || message, {
          duration: matchingRule.duration,
          ruleId: matchingRule.id,
        });
        return true;
      }
      return false;
    },
    [checkRules, showAlert]
  );

  // Exporter les règles
  const exportRules = useCallback(() => {
    return JSON.stringify(state.rules, null, 2);
  }, [state.rules]);

  // Importer des règles
  const importRules = useCallback((rulesJson: string) => {
    try {
      const rules = JSON.parse(rulesJson) as AlertRule[];
      setState(prev => ({
        ...prev,
        rules,
      }));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import des règles:', error);
      return false;
    }
  }, []);

  // Nettoyer l'historique
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
    }));
  }, []);

  return {
    rules: state.rules,
    history: state.history,
    addRule,
    removeRule,
    toggleRule,
    showAlert,
    processMessage,
    exportRules,
    importRules,
    clearHistory,
  };
};
