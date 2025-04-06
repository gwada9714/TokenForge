import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Alert, Snackbar } from "@mui/material";
import { useTokenForgeAdmin } from "../../../../hooks/useTokenForgeAdmin";
import type { AlertRule } from "../../../../types/contracts";
import { AlertForm } from "./AlertForm";
import { AlertList } from "./AlertList";
import { AdminComponentProps } from "../types";

/**
 * Composant de gestion des alertes.
 * Permet de créer, modifier et supprimer des règles d'alerte.
 *
 * @component
 * @example
 * ```tsx
 * <AlertsManagement onError={(msg) => console.error(msg)} />
 * ```
 */
export const AlertsManagement: React.FC<AdminComponentProps> = ({
  onError,
}) => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleCondition, setNewRuleCondition] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { contract } = useTokenForgeAdmin();

  const loadAlertRules = useCallback(async () => {
    try {
      setIsLoading(true);
      // Implémentation à venir
      const rules = await contract.getAlertRules();
      setAlertRules(rules);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to load alert rules"
      );
    } finally {
      setIsLoading(false);
    }
  }, [contract, onError]);

  const handleAddRule = useCallback(
    async (name: string, condition: string) => {
      try {
        setIsLoading(true);
        await contract.addAlertRule({ name, condition });
        await loadAlertRules();
        setSuccess("Alert rule added successfully");
        setNewRuleName("");
        setNewRuleCondition("");
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "Failed to add alert rule"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [contract, loadAlertRules, onError]
  );

  const handleDeleteRule = useCallback(
    async (ruleId: string) => {
      try {
        setIsLoading(true);
        await contract.deleteAlertRule(ruleId);
        await loadAlertRules();
        setSuccess("Alert rule deleted successfully");
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "Failed to delete alert rule"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [contract, loadAlertRules, onError]
  );

  useEffect(() => {
    loadAlertRules().catch((error) => {
      onError(
        error instanceof Error
          ? error.message
          : "Failed to load initial alert rules"
      );
    });
  }, [loadAlertRules, onError]);

  const handleCloseSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Alert Rules Management
      </Typography>

      <AlertForm
        onSubmit={handleAddRule}
        isLoading={isLoading}
        newRuleName={newRuleName}
        newRuleCondition={newRuleCondition}
        onNameChange={setNewRuleName}
        onConditionChange={setNewRuleCondition}
      />

      <AlertList
        rules={alertRules}
        onDelete={handleDeleteRule}
        isLoading={isLoading}
      />

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(AlertsManagement);
